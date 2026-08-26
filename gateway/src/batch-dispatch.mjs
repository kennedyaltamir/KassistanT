// @ts-nocheck
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { sendText as defaultSendText } from './whatsapp.mjs';

export const BATCH_STATES = Object.freeze(['DRAFT','CONFIRMED','QUEUED','PROCESSING','COMPLETED','PARTIAL_FAILURE','FAILED','CANCELLED']);
export const RECIPIENT_STATES = Object.freeze(['PENDING','PROCESSING','SUCCESS','RETRY_WAIT','FAILED_TERMINAL','CANCELLED']);
export const EFFECT_PHASES = Object.freeze(['REQUEST_PREPARED','REQUEST_ATTEMPTED','PROVIDER_OBSERVED','UNKNOWN']);
export const MAX_ATTEMPTS = 5;
export const BACKOFF_MS = Object.freeze([30_000,60_000,120_000,240_000]);
export const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000;
function defaultStatePath(){ return process.env.KASSIST_BATCH_STATE_PATH ?? path.resolve(process.cwd(),'.data/dispatch/batches.json'); }
function nowIso(clock){ return new Date(clock()).toISOString(); }
/** @returns {string} */
function newId(){ return String(crypto.randomUUID()); }
function effectIdentity(batchId, recipientIdentity){ return crypto.createHash('sha256').update(`${batchId}:${recipientIdentity}`,'utf8').digest('hex'); }
function canonicalRecipients(recipients){ return recipients.map((recipient)=>({normalizedNumber:String(recipient.normalizedNumber??'').trim(),context:String(recipient.context??''),contact:recipient.contact??null})); }
function assertString(value,name){ const result=String(value??'').trim(); if(!result) throw new Error(`${name} is required`); return result; }
function classifyFailure(error){
  const message=error instanceof Error?error.message:String(error);
  const statusCode=typeof error==='object'&&error!==null&&'output'in error&&typeof error.output==='object'&&error.output!==null&&typeof error.output.statusCode==='number'?error.output.statusCode:typeof error==='object'&&error!==null&&'statusCode'in error&&typeof error.statusCode==='number'?error.statusCode:undefined;
  if([429,500,502,503,504].includes(statusCode)) return {kind:'RETRYABLE',message};
  if(['ECONNRESET','ETIMEDOUT','ENETUNREACH','EAI_AGAIN','ECONNREFUSED','EPIPE'].some((code)=>message.includes(code))) return {kind:'RETRYABLE',message};
  if(/not connected|connection is closed|temporarily unavailable|timeout/i.test(message)) return {kind:'RETRYABLE',message};
  return {kind:'TERMINAL',message};
}
function makeInitialState(){ return {version:1,batches:{}}; }
export class BatchDispatchRuntime {
  constructor({sendText=defaultSendText,statePath=defaultStatePath(),clock=()=>Date.now(),setTimeoutImpl=setTimeout}={}){ this.sendText=sendText; this.statePath=statePath; this.clock=clock; this.setTimeoutImpl=setTimeoutImpl; this.state=makeInitialState(); this.retryTimers=new Map(); this.ready=this.#load(); }
  async #load(){
    try{ const raw=await fs.readFile(this.statePath,'utf8'); const parsed=JSON.parse(raw); if(!parsed||parsed.version!==1||typeof parsed.batches!=='object') throw new Error('invalid dispatch journal'); this.state=parsed; }
    catch(error){ if(error?.code!=='ENOENT') console.error('[KassisT Dispatch] failed to load dispatch journal:',error instanceof Error?error.message:error); this.state=makeInitialState(); }
    await this.#recoverAfterRestart(); await this.#save();
  }
  async #save(){ const directory=path.dirname(this.statePath); await fs.mkdir(directory,{recursive:true}); const tempPath=`${this.statePath}.tmp`; await fs.writeFile(tempPath,`${JSON.stringify(this.state,null,2)}\n`,'utf8'); await fs.rename(tempPath,this.statePath); }
  #batch(batchId){ const batch=this.state.batches[batchId]; if(!batch) throw new Error(`Batch not found: ${batchId}`); return batch; }
  #aggregate(batch){
    const recipients=Object.values(batch.recipients); const hasProcessing=recipients.some(r=>r.state==='PROCESSING'); const hasRetryWait=recipients.some(r=>r.state==='RETRY_WAIT'); const hasPending=recipients.some(r=>r.state==='PENDING'); const hasSuccess=recipients.some(r=>r.state==='SUCCESS'); const hasTerminalFailure=recipients.some(r=>r.state==='FAILED_TERMINAL'); const hasCancelled=recipients.some(r=>r.state==='CANCELLED');
    if(batch.cancellationRequested&&!hasProcessing&&!hasRetryWait&&!hasPending) return 'CANCELLED';
    if(hasProcessing) return 'PROCESSING'; if(hasRetryWait||hasPending) return 'PROCESSING';
    if(recipients.length>0&&recipients.every(r=>r.state==='SUCCESS')) return 'COMPLETED';
    if(hasSuccess&&hasTerminalFailure) return 'PARTIAL_FAILURE';
    if(!hasSuccess&&hasTerminalFailure&&!hasCancelled) return 'FAILED';
    if(hasCancelled&&!hasSuccess&&!hasTerminalFailure) return 'CANCELLED';
    return batch.state;
  }
  async createDraft(preview,{correlationId=newId(),batchId=newId(),createdAt=nowIso(this.clock)}={}){
    await this.ready; if(!preview||preview.status!=='PREVIEW') throw new Error('A PREVIEW is required to create a batch'); if(!preview.fingerprint) throw new Error('Preview fingerprint is required'); if(!Array.isArray(preview.recipients)||preview.recipients.length===0) throw new Error('Preview must contain recipients');
    const recipients={}; for(const item of canonicalRecipients(preview.recipients)){ const identity=assertString(item.normalizedNumber,'recipient identity'); if(recipients[identity]) throw new Error(`Duplicate recipient identity in confirmed set: ${identity}`); recipients[identity]={identity,context:item.context,contact:item.contact,state:'PENDING',idempotencyIdentity:effectIdentity(batchId,identity),attempts:[],nextRetryAt:null}; }
    this.state.batches[batchId]={batchId,state:'DRAFT',createdAt,updatedAt:createdAt,correlationId:assertString(correlationId,'correlationId'),causationId:newId(),preview:{fingerprint:String(preview.fingerprint),sourceName:preview.sourceName??'upload.csv',recipientCount:Object.keys(recipients).length,recipients:canonicalRecipients(preview.recipients)},recipients,cancellationRequested:false};
    await this.#save(); return this.#batch(batchId);
  }
  async confirmBatch(batchId,{fingerprint,recipientCount,correlationId,confirmedAt=nowIso(this.clock)}){
    await this.ready; const batch=this.#batch(batchId); if(batch.state!=='DRAFT') throw new Error(`Batch cannot be confirmed from state ${batch.state}`); if(String(fingerprint)!==batch.preview.fingerprint) throw new Error('Preview fingerprint mismatch'); if(Number(recipientCount)!==batch.preview.recipientCount) throw new Error('Recipient count mismatch'); batch.state='CONFIRMED'; batch.confirmation={batchId,recipientCount:batch.preview.recipientCount,fingerprint:batch.preview.fingerprint,timestamp:confirmedAt,correlationId:assertString(correlationId??batch.correlationId,'correlationId')}; batch.causationId=newId(); batch.updatedAt=nowIso(this.clock); await this.#save(); return batch;
  }
  async queueBatch(batchId,{causationId=newId()}={}){
    await this.ready; const batch=this.#batch(batchId); if(batch.state!=='CONFIRMED') throw new Error(`Batch cannot be queued from state ${batch.state}`); batch.state='QUEUED'; batch.causationId=causationId; batch.updatedAt=nowIso(this.clock); await this.#save(); void this.processBatch(batchId).catch(error=>console.error('[KassisT Dispatch] batch processing failed:',error instanceof Error?error.message:error)); return batch;
  }
  async processBatch(batchId){
    await this.ready; const batch=this.#batch(batchId); if(!['QUEUED','PROCESSING'].includes(batch.state)) return batch; if(batch.state==='QUEUED') batch.state='PROCESSING'; batch.updatedAt=nowIso(this.clock); await this.#save();
    for(const recipient of Object.values(batch.recipients)){ if(batch.cancellationRequested) break; if(recipient.state==='PENDING') await this.#processRecipient(batch,recipient); }
    await this.#updateAggregate(batch); return batch;
  }
  async #processRecipient(batch,recipient){
    if(recipient.state!=='PENDING') return; recipient.state='PROCESSING'; const attemptNumber=recipient.attempts.length+1; const attempt={attempt:attemptNumber,idempotencyIdentity:recipient.idempotencyIdentity,startedAt:nowIso(this.clock),phase:'REQUEST_PREPARED',causationId:newId(),effectStatus:'OBSERVED'}; recipient.attempts.push(attempt); batch.updatedAt=nowIso(this.clock); await this.#save(); attempt.phase='REQUEST_ATTEMPTED'; attempt.requestedAt=nowIso(this.clock); await this.#save();
    try{ const message=await this.sendText(recipient.identity,recipient.context); attempt.phase='PROVIDER_OBSERVED'; attempt.completedAt=nowIso(this.clock); attempt.providerObservation={level:'TRANSPORT_OBSERVED',messageId:message?.id??null,deliveryConfirmed:false,readConfirmed:false}; recipient.state='SUCCESS'; recipient.nextRetryAt=null; recipient.lastError=null; }
    catch(error){ const failure=classifyFailure(error); attempt.phase='UNKNOWN'; attempt.completedAt=nowIso(this.clock); attempt.failure={class:failure.kind,message:failure.message}; attempt.effectStatus='FAILED_OBSERVED'; recipient.lastError=failure.message; if(failure.kind==='RETRYABLE'&&attemptNumber<MAX_ATTEMPTS&&!batch.cancellationRequested){ recipient.state='RETRY_WAIT'; recipient.nextRetryAt=new Date(this.clock()+BACKOFF_MS[attemptNumber-1]).toISOString(); this.#scheduleRetry(batch.batchId,recipient.identity,BACKOFF_MS[attemptNumber-1]); } else { recipient.state='FAILED_TERMINAL'; recipient.nextRetryAt=null; } }
    batch.updatedAt=nowIso(this.clock); await this.#save();
  }
  #scheduleRetry(batchId,recipientIdentity,delay){ const key=`${batchId}:${recipientIdentity}`; if(this.retryTimers.has(key)) return; const timer=this.setTimeoutImpl(()=>{this.retryTimers.delete(key); void this.retryRecipient(batchId,recipientIdentity).catch(error=>console.error('[KassisT Dispatch] retry failed:',error instanceof Error?error.message:error));},delay); this.retryTimers.set(key,timer); }
  async retryRecipient(batchId,recipientIdentity){
    await this.ready; const batch=this.#batch(batchId); const recipient=batch.recipients[recipientIdentity]; if(!recipient) throw new Error(`Recipient not found: ${recipientIdentity}`); if(batch.cancellationRequested||recipient.state!=='RETRY_WAIT') return batch; if(!recipient.nextRetryAt||new Date(recipient.nextRetryAt).getTime()>this.clock()) return batch; if(recipient.attempts.length>=MAX_ATTEMPTS){recipient.state='FAILED_TERMINAL';recipient.nextRetryAt=null;await this.#save();return batch;} recipient.state='PENDING';recipient.nextRetryAt=null;await this.#save();await this.#processRecipient(batch,recipient);await this.#updateAggregate(batch);return batch;
  }
  async cancelBatch(batchId){
    await this.ready; const batch=this.#batch(batchId); if(['COMPLETED','PARTIAL_FAILURE','FAILED','CANCELLED'].includes(batch.state)) return batch; batch.cancellationRequested=true;
    for(const recipient of Object.values(batch.recipients)){ if(['PENDING','RETRY_WAIT'].includes(recipient.state)) recipient.state='CANCELLED'; }
    batch.state=['DRAFT','CONFIRMED','QUEUED'].includes(batch.state)?'CANCELLED':this.#aggregate(batch); batch.causationId=newId(); batch.updatedAt=nowIso(this.clock); await this.#save(); return batch;
  }
  async #updateAggregate(batch){ const next=this.#aggregate(batch); if(next==='PROCESSING'&&batch.state==='CONFIRMED') batch.state='QUEUED'; else if(!['CONFIRMED','QUEUED','DRAFT'].includes(next)) batch.state=next; batch.updatedAt=nowIso(this.clock); await this.#save(); }
  async #recoverAfterRestart(){
    for(const batch of Object.values(this.state.batches)){
      if(batch.state==='PROCESSING') for(const recipient of Object.values(batch.recipients)){ const currentAttempt=recipient.attempts.at(-1); if(recipient.state==='PROCESSING'&&currentAttempt&&currentAttempt.phase==='REQUEST_ATTEMPTED'){ currentAttempt.phase='UNKNOWN'; currentAttempt.completedAt=nowIso(this.clock); currentAttempt.effectStatus='INDETERMINATE_EFFECT_UNRESOLVED'; currentAttempt.recovery='RESTART_INTERRUPTED'; recipient.recoveryBlocked=true; recipient.lastError='External effect may have crossed the boundary before restart; reconciliation is unavailable.'; } }
      for(const recipient of Object.values(batch.recipients)) if(recipient.state==='RETRY_WAIT'&&recipient.nextRetryAt){ const delay=Math.max(0,new Date(recipient.nextRetryAt).getTime()-this.clock()); this.#scheduleRetry(batch.batchId,recipient.identity,delay); }
    }
  }
  async getBatch(batchId){ await this.ready; return this.#batch(batchId); }
  async listBatches(){ await this.ready; return Object.values(this.state.batches); }
}
export function createBatchDispatchRuntime(options={}){ return new BatchDispatchRuntime(options); }
