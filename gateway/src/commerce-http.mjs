import { buildBusinessContext, createOrder, createProduct, dashboard, deleteProduct, getBusiness, getCustomerByJid, listCustomers, listOrders, listProducts, updateBusiness, updateCustomer, updateProduct } from './commerce.mjs';

function body(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { raw += chunk; if (raw.length > 1_000_000) { reject(new Error('Request body too large')); request.destroy(); } });
    request.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON body')); } });
    request.on('error', reject);
  });
}
function json(response, status, payload) { const text = JSON.stringify(payload); response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-length': Buffer.byteLength(text) }); response.end(text); return true; }

export async function handleCommerceRequest(request, response) {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  try {
    if (request.method === 'GET' && url.pathname === '/api/business') return json(response, 200, await getBusiness());
    if (request.method === 'PUT' && url.pathname === '/api/business') return json(response, 200, await updateBusiness(await body(request)));
    if (request.method === 'GET' && url.pathname === '/api/catalog/products') return json(response, 200, await listProducts());
    if (request.method === 'POST' && url.pathname === '/api/catalog/products') return json(response, 201, await createProduct(await body(request)));
    const productMatch = url.pathname.match(/^\/api\/catalog\/products\/([^/]+)$/);
    if (productMatch && request.method === 'PUT') return json(response, 200, await updateProduct(decodeURIComponent(productMatch[1]), await body(request)));
    if (productMatch && request.method === 'DELETE') return json(response, 200, await deleteProduct(decodeURIComponent(productMatch[1])));
    if (request.method === 'GET' && url.pathname === '/api/customers') return json(response, 200, await listCustomers());
    if (request.method === 'GET' && url.pathname === '/api/customers/by-phone') return json(response, 200, await getCustomerByJid(url.searchParams.get('phone') ?? ''));
    const customerMatch = url.pathname.match(/^\/api\/customers\/([^/]+)$/);
    if (customerMatch && request.method === 'PUT') return json(response, 200, await updateCustomer(decodeURIComponent(customerMatch[1]), await body(request)));
    if (request.method === 'GET' && url.pathname === '/api/orders') return json(response, 200, await listOrders());
    if (request.method === 'POST' && url.pathname === '/api/orders') return json(response, 201, await createOrder(await body(request)));
    if (request.method === 'GET' && url.pathname === '/api/dashboard') return json(response, 200, await dashboard());
    if (request.method === 'GET' && url.pathname === '/api/business/context') return json(response, 200, await buildBusinessContext());
    return false;
  } catch (error) {
    return json(response, 400, { error: error instanceof Error ? error.message : String(error) });
  }
}
