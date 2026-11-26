import json
M=json.load(open('audio/lines/meta.json')); dur=lambda i:M[i]['dur']
H=lambda nm,g=.12,v='huss':('L',g,v,nm)
P=[('S','s1'),('L',.15,'n1','n1'),('B',.5,'dunk'),('L',0,'g_small','g_small'),('B',.9,'stare'),
('S','s2'),('L',.1,'n2','n2'),('B',.3,'b2'),('L',0,'j_bro','j_bro'),('B',1.5,'cross'),('L',0,'j_hip','j_hip'),('B',1.0,'walkaway'),
('S','s3'),('L',.1,'n3','n3'),('B',.15,'m0'),
 H('h1',0,'hussL'),H('h2'),H('h3'),('B',.25,'m1'),H('h4',0,'hussL'),H('h5'),H('h6'),('B',.25,'m2'),H('h7',0,'hussL'),H('h8'),H('h9'),('B',.25,'m3'),H('h10',0,'hussL'),H('h11'),H('h12'),
 ('L',.35,'a_btw','a_btw'),('B',2.4,'lambo'),('B',.8,'stare3'),
('S','s4'),('L',.1,'n4','n4'),('B',1.0,'peek'),('L',0,'b_cookie','b_cookie'),('L',.3,'g_bulk','g_bulk'),('B',1.2,'zoom4'),
('S','s5'),('L',.1,'n5','n5'),('L',.25,'m_pkg','m_pkg'),('B',1.6,'follow'),('L',0,'n5b','n5b'),('B',1.4,'open'),('L',0,'a_bro','a_bro'),('B',1.6,'curtain'),
('S','s6'),('L',.1,'n6','n6'),('B',1.2,'crowd'),H('h13',0,'hussL'),H('h14'),H('h15',.12,'hussL'),('B',.6,'yawn'),('B',1.8,'gdunk'),('L',0,'g_calc','g_calc'),('B',1.3,'laugh'),
('S','s7'),('L',.1,'n7','n7'),('B',.9,'drop'),('L',0,'a_wait','a_wait'),('B',.5,'cutrudy'),('L',0,'r_square','r_square'),('B',1.4,'reveal7'),('B',1.3,'gasp'),
('S','s8'),('L',.1,'n8','n8'),('B',1.5,'brief'),('B',1.1,'steal'),('L',0,'g_party','g_party'),('B',.7,'stare8'),('L',0,'a_home','a_home'),('B',.12,'end')]
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
