import json
M=json.load(open('audio/lines/meta.json')); dur=lambda i:M[i]['dur']
H=lambda nm,g=.1,v='huss':('L',g,v,nm)
P=[('S','s1'),('L',.12,'n1','n1'),('B',.15,'n1x'),('L',0,'n1b','n1b'),('B',.9,'bug'),('L',0,'g_money','g_money'),('B',1.1,'speechless'),
('S','s2'),('L',.1,'n2','n2'),
 H('h1',0,'hussL'),H('h2'),H('h3'),('B',.3,'w1'),H('h4',0,'hussL'),H('h5'),H('h6'),('B',.2,'w2'),
 ('L',.1,'a_btw','a_btw'),('B',1.4,'party'),('B',1.3,'pay'),('L',0,'a_bro','a_bro'),('B',.5,'brohold'),
('S','s3'),('L',.1,'n3','n3'),('B',.3,'enter'),('L',0,'a_cust','a_cust'),('L',.25,'b_zero','b_zero'),('B',.35,'zp'),('L',0,'a_how','a_how'),('L',.3,'b_good','b_good'),('B',2.0,'ferrari'),('B',.9,'confused'),
('S','s4'),('L',.1,'n4','n4'),('B',.2,'m0'),('L',0,'a_pkgs','a_pkgs'),('L',.2,'m_none','m_none'),('B',1.6,'pool'),('B',1.3,'ding'),('L',0,'a_teach','a_teach'),('B',1.1,'runaway'),
('S','s5'),('L',.1,'n5','n5'),('B',1.1,'office'),('L',0,'a_howall','a_howall'),('L',.25,'my_hard','my_hard'),('B',.25,'cut5'),
 H('h7',0,'hussL'),H('h8',.15),H('h9',.15,'hussL'),('B',.3,'w3'),('B',1.0,'pay2'),('L',0,'a_done','a_done'),('B',.5,'donehold'),
('S','s6'),('L',.1,'n6','n6'),('L',.2,'n6b','n6b'),('B',1.7,'bush'),('B',.8,'pass'),('L',0,'g_nike','g_nike'),('B',.9,'freeze'),('B',1.2,'shrug'),
('S','s7'),('L',.1,'n7','n7'),('B',1.3,'peek'),('B',2.0,'admin'),('B',.8,'burst'),('L',0,'a_why','a_why'),('L',.2,'g_notif','g_notif'),('B',1.3,'zoomface'),
('S','s8'),('L',.1,'n8','n8'),('B',1.2,'billion'),('B',1.7,'buy'),
 H('j1',.1,'j_hussL'),H('j2',.1,'j_huss'),H('j3',.1,'j_hussL'),('L',.15,'a_final','a_final'),('B',.05,'end')]
fixed=sum(dur(x[2]) for x in P if x[0]=='L'); flex=sum(x[1] for x in P if x[0] in 'LB')
k=(90.0-fixed)/flex; print('fixed',round(fixed,2),'flex',round(flex,2),'scale',round(k,3))
t=0;ev={};lines=[];scenes={};cur=None
for x in P:
    if x[0]=='S':
        if cur: scenes[cur][1]=t
        cur=x[1];scenes[cur]=[t,None]
    elif x[0]=='L':
        t+=x[1]*k; d=dur(x[2]); lines.append(dict(id=x[2],name=x[3],speaker=M[x[2]]['speaker'],text=M[x[2]]['text'],start=round(t,3),dur=round(d,3))); ev[x[3]]=[round(t,3),round(t+d,3)]; t+=d
    else: ev[x[2]]=[round(t,3),round(t+x[1]*k,3)]; t+=x[1]*k
scenes[cur][1]=t
for s,r in scenes.items(): print(s,[round(v,2) for v in r])
json.dump(dict(lines=lines,ev=ev,scenes=scenes,total=90.0),open('timeline.json','w'),indent=1)
print(' '.join(f'{a}:{b[0]:.2f}-{b[1]:.2f}' for a,b in ev.items()))
