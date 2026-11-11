import requests, uuid, json, time, os
ORIGIN=os.environ.get('SERVICEHUB_URL','http://127.0.0.1:13600').rstrip('/')
BASE=ORIGIN+'/main/api'
def login(email,password='ServiceHub2026!'):
 s=requests.Session();s.headers.update({'Origin':ORIGIN});r=s.post(BASE+'/auth/sign-in/email',json={'email':email,'password':password},headers={'Origin':ORIGIN});assert r.status_code==200,(email,r.status_code);return s
def body(r):
 assert r.status_code==200,(r.status_code,r.text[:400]);return r.json()['data']
admin=login('admin@nocobase.com','admin123')
r=body(admin.get(BASE+'/portalCenter/portals'));print('catalog',json.dumps(r,ensure_ascii=False)[:1800])
for p in r:
 if p['id']!='insights' and not p['installed']:
  response=admin.put(BASE+'/portalCenter/portals/'+p['id']+'/installation',json={'installed':True,'revision':p['revision']},headers={'Idempotency-Key':str(int(time.time()*1000))+'.'+str(uuid.uuid4())});print('install',p['id'],response.status_code,response.text[:180]);assert response.status_code==200
customer=login('customer-1@servicehub.example');dispatch=login('dispatcher@servicehub.example');engineer=login('engineer-1@servicehub.example')
for s,p in [(customer,'customer'),(dispatch,'dispatch'),(engineer,'engineer')]:
 data=body(s.get(BASE+'/serviceHub/'+p));print(p,len(data['tickets']),len(data['devices']))
assert customer.get(BASE+'/serviceHub/dispatch').status_code==403
assert requests.get(BASE+'/serviceHub/customer').status_code==401
created=body(customer.post(BASE+'/serviceHub/customer/tickets',headers={'Idempotency-Key':str(int(time.time()*1000))+'.'+str(uuid.uuid4())},json={'deviceId':'device-1','title':'Demo: Espresso machine not heating','description':'The machine is not heating. Please arrange an inspection.','priority':'urgent'}));print('created',str(created)[:300])
ticket=created['record']
for s,p,action,extra in [(dispatch,'dispatch','assign',{'engineerId':'engineer-1'}),(engineer,'engineer','accept',{}),(engineer,'engineer','complete',{'resolution':'Replaced the thermostat and verified normal operation.'}),(customer,'customer','confirm',{'rating':5})]:
 payload={'transition':action,'requestId':str(uuid.uuid4()),'version':ticket['lifecycleVersion'],**extra}
 ticket=body(s.post(BASE+'/serviceHub/'+p+'/tickets/'+ticket['id']+'/fire',json=payload));print(action,ticket['status'],ticket['lifecycleVersion'])
 assert s.post(BASE+'/serviceHub/'+p+'/tickets/'+ticket['id']+'/fire',json=payload).status_code==200
other=login('customer-2@servicehub.example')
assert all(t['customerId']=='customer-2' for t in body(other.get(BASE+'/serviceHub/customer'))['tickets'])
assert other.post(BASE+'/serviceHub/customer/tickets/'+ticket['id']+'/fire',json={'transition':'confirm','requestId':str(uuid.uuid4()),'version':ticket['lifecycleVersion'],'rating':1}).status_code==403
print('PASS: complete journey, retry replay, anonymous/role/customer isolation')
key=str(int(time.time()*1000))+'.'+str(uuid.uuid4())
report={'deviceId':'device-1','title':'Submission replay check','description':'Retrying the same submission should create just one ticket.','priority':'normal'}
a=body(customer.post(BASE+'/serviceHub/customer/tickets',headers={'Idempotency-Key':key},json=report))
b=body(customer.post(BASE+'/serviceHub/customer/tickets',headers={'Idempotency-Key':key},json=report))
assert a['record']['id']==b['record']['id']
assert customer.post(BASE+'/serviceHub/reset',json={'confirm':'RESET'}).status_code==403
assert customer.post(BASE+'/serviceHub/customer/tickets/'+a['record']['id']+'/fire',json={'transition':'confirm','requestId':str(uuid.uuid4()),'version':a['record']['lifecycleVersion'],'rating':5}).status_code==400
for installed in [True,False]:
 portal=next(p for p in body(admin.get(BASE+'/portalCenter/portals')) if p['id']=='insights')
 body(admin.put(BASE+'/portalCenter/portals/insights/installation',headers={'Idempotency-Key':str(int(time.time()*1000))+'.'+str(uuid.uuid4())},json={'installed':installed,'revision':portal['revision']}))
 assert admin.get(BASE+'/serviceHub/insights').status_code==(200 if installed else 409)
 assert ('insights' in body(admin.get(BASE+'/serviceHub/access'))['portals'])==installed
body(admin.post(BASE+'/serviceHub/reset',json={'confirm':'RESET'}))
assert len(body(dispatch.get(BASE+'/serviceHub/dispatch'))['tickets'])==12
print('PASS: report idempotency, invalid state, protected reset, portal install/uninstall, restored 12 tickets')
