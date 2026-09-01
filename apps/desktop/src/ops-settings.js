(() => {
  const GATEWAY='http://127.0.0.1:3210';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function api(path,options={}){const r=await fetch(GATEWAY+path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.error||`HTTP ${r.status}`);return b;}
  let initialized=false;
  async function mount(){
    const page=document.querySelector('.nav button.active')?.dataset?.page; if(page!=='settings') return;
    const host=document.querySelector('.settings-content'); if(!host) return;
    if(host.querySelector('[data-kassist-ops-settings]')) return;
    try{
      const [business,config]=await Promise.all([api('/api/business'),api('/api/whatsapp/ai/config')]);
      const form=business.businessForm||{};
      const fallback=(config.fallbackProviders||[]).join(',');
      const box=document.createElement('div'); box.dataset.kassistOpsSettings='1'; box.className='setting-block';
      box.innerHTML=`<h4>Operação comercial e IA</h4><p class="muted" style="margin-bottom:14px">Essas configurações são persistidas localmente e entram no contexto do atendimento.</p><div class="grid grid-2"><div class="field"><label>Nome do negócio</label><input id="ops-business-name" value="${esc(business.name||'')}" /></div><div class="field"><label>Taxa de entrega (centavos)</label><input id="ops-delivery-fee" type="number" min="0" value="${Number(business.deliveryFeeCents||0)}" /></div><div class="field"><label>Pedido mínimo (centavos)</label><input id="ops-min-order" type="number" min="0" value="${Number(business.minOrderCents||0)}" /></div><div class="field"><label>Entrega</label><select id="ops-delivery-enabled"><option value="true" ${business.deliveryEnabled?'selected':''}>Ativada</option><option value="false" ${business.deliveryEnabled?'':'selected'}>Desativada</option></select></div><div class="field" style="grid-column:1/-1"><label>Formulário do negócio (JSON)</label><textarea id="ops-business-form" style="min-height:180px">${esc(JSON.stringify(form,null,2))}</textarea><small>Ex.: horário, endereço da loja, formas de pagamento, regras de atendimento, observações e políticas.</small></div></div><div class="actions" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" id="ops-business-save">Salvar negócio</button></div><hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><div class="grid grid-2"><div class="field"><label>Provedor principal</label><select id="ops-llm-provider">${['ollama','groq','gemini','mistral'].map(p=>`<option value="${p}" ${config.provider===p?'selected':''}>${p}</option>`).join('')}</select></div><div class="field"><label>Modelo</label><input id="ops-llm-model" value="${esc(config.model||'qwen3:14b')}" /></div><div class="field" style="grid-column:1/-1"><label>Fallbacks (separados por vírgula)</label><input id="ops-llm-fallbacks" value="${esc(fallback)}" placeholder="groq,gemini,ollama" /></div><div class="field" style="grid-column:1/-1"><label>Autoatendimento</label><select id="ops-ai-enabled"><option value="true" ${config.enabled?'selected':''}>Ativado</option><option value="false" ${config.enabled?'':'selected'}>Desativado</option></select></div></div><div class="actions" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" id="ops-ai-save">Salvar configuração da IA</button></div>`;
      host.appendChild(box);
      document.querySelector('#ops-business-save').addEventListener('click',async()=>{try{const parsed=JSON.parse(document.querySelector('#ops-business-form').value||'{}');await api('/api/business',{method:'PUT',body:JSON.stringify({name:document.querySelector('#ops-business-name').value,delivery_fee_cents:Number(document.querySelector('#ops-delivery-fee').value),min_order_cents:Number(document.querySelector('#ops-min-order').value),delivery_enabled:document.querySelector('#ops-delivery-enabled').value==='true',business_form:parsed})});alert('Configuração do negócio salva.');}catch(e){alert(e.message||String(e));}});
      document.querySelector('#ops-ai-save').addEventListener('click',async()=>{try{const fallbacks=document.querySelector('#ops-llm-fallbacks').value.split(',').map(x=>x.trim()).filter(Boolean);await api('/api/whatsapp/ai/config',{method:'PUT',body:JSON.stringify({provider:document.querySelector('#ops-llm-provider').value,model:document.querySelector('#ops-llm-model').value,fallbackProviders:fallbacks,enabled:document.querySelector('#ops-ai-enabled').value==='true'})});alert('Configuração da IA salva.');}catch(e){alert(e.message||String(e));}});
      initialized=true;
    }catch(error){console.error('[KassisT UI] ops settings',error);}
  }
  const observer=new MutationObserver(()=>{if(!initialized)void mount();});
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(()=>{initialized=false;void mount();},50),true);
  setTimeout(mount,400);
})();
