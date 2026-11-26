import json
M=json.load(open('audio/lines/meta.json'))
dur=lambda i:M[i]['dur']
H=lambda nm,g=.12,v='huss':('L',g,v,nm)
P=[('S','s1'),('L',.2,'n1','n1'),('L',.15,'btw','btw1'),('B',.7,'s1end'),
('S','s2'),('L',.1,'n2','n2'),('B',.7,'s2end'),
('S','s3'),('L',.1,'n3','n3'),('B',.9,'miss'),('L',0,'j_bro','j_bro'),('B',1.6,'panic'),
('S','s4'),('L',.1,'n4','n4'),('B',.3,'lift'),H('h1',0,'hussL'),H('h2'),H('h3',.12,'hussL'),('L',.35,'d4','d4'),('L',.22,'btw','btw4'),('B',.5,'s4end'),
('S','s5'),('L',.1,'n5','n5'),('B',1.6,'prep'),H('h4',0),H('h5',.2),H('h6',.25,'hussL'),('B',1.0,'shot'),('B',1.4,'awk5'),
('S','s6'),('L',.1,'n6','n6'),('L',.15,'btw','btw6'),('B',.3,'pu'),H('h7',0),H('h8',.25),H('h9',.35),('B',.9,'collapse'),
('S','s7'),('L',.1,'n7','n7'),('L',.25,'j_wifi','j_wifi'),('B',.2,'sq'),H('h10',0),H('h11'),H('h12',.12,'hussL'),('L',.12,'j_stop','j_stop'),('B',.8,'s7end'),
('S','s8'),('L',.1,'n8','n8'),('B',.3,'kick0'),H('h13',0,'hussL'),('B',2.8,'reveal'),
('S','s9'),('L',.1,'n9','n9'),('B',1.4,'s9end'),
('S','s10'),('L',.1,'n10','n10'),('B',.5,'surround'),('L',0,'m_lebron','m_lebron'),('L',.35,'c_dribble','c_dribble'),('B',2.0,'crown'),
('S','s11'),('L',.1,'n11','n11'),('B',1.6,'fullcourt'),H('h14',0),H('h15',.2),H('h16',.25,'hussL'),('B',1.2,'alexmiss'),('L',0,'j_aimbot','j_aimbot'),('B',.3,'pull'),('L',0,'d11','d11'),('L',.12,'btw','btw11'),('B',.5,'final')]
fixed=sum(dur(x[2]) for x in P if x[0]=='L')
flex=sum(x[1] for x in P if x[0] in 'LB')
k=(90.0-fixed)/flex; print('fixed',round(fixed,2),'flex',round(flex,2),'scale',round(k,3))
t=0;ev={};lines=[];scenes={};cur=None
for x in P:
    if x[0]=='S':
        if cur: scenes[cur][1]=t
        cur=x[1];scenes[cur]=[t,None]
    elif x[0]=='L':
        t+=x[1]*k; d=dur(x[2]); lines.append(dict(id=x[2],name=x[3],speaker=M[x[2]]['speaker'],text=M[x[2]]['text'],start=round(t,3),dur=round(d,3)))
        ev[x[3]]=[round(t,3),round(t+d,3)]; t+=d
    else: ev[x[2]]=[round(t,3),round(t+x[1]*k,3)]; t+=x[1]*k
scenes[cur][1]=t
print('end',round(t,3))
for s,r in scenes.items(): print(s,[round(v,2) for v in r])
json.dump(dict(lines=lines,ev=ev,scenes=scenes,total=90.0),open('timeline.json','w'),indent=1)
print(' '.join(f'{a}:{b[0]:.2f}-{b[1]:.2f}' for a,b in ev.items()))
