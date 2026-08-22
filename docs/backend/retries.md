# Retries

Status: DEFINED / PARTIAL.

Retryable work uses bounded attempts and backoff with jitter. Terminal failures remain observable in failed/dead-letter state. Exact attempt counts and provider retry policies remain PARTIAL/EXTERNAL.