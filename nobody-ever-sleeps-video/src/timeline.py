import json
M=json.load(open('audio/lines/meta.json')); dur=lambda i:M[i]['dur']
H=lambda nm,g=.1,v='huss':('L',g,v,nm)
P=[('S','s1'),('L',.12,'n1','n1'),('B',.2,'n1x'),('L',0,'n1b','n1b'),('B',.4,'pushup'),('L',0,'g_sleep','g_sleep'),('B',1.7,'sleepy'),
('S','s2'),('L',.1,'n2','n2'),H('h1',.1,'hussL'),H('h2',.12),H('h3',.12,'hussL'),('L',.25,'a_btw','a_btw'),('B',1.3,'party2'),('B',1.7,'doze'),('L',0,'a_awake','a_awake'),('B',.4,'awk'),
('S','s3'),('L',.1,'n3','n3'),('B',.6,'bucket'),('L',0,'a_coffee','a_coffee'),('L',.25,'b_yes','b_yes'),('B',2.0,'pizzas'),('B',1.1,'sip'),
 H('f1',0,'hussF'),H('f2',.03,'hussF'),H('f3',.03,'hussF'),H('f4',.03,'hussF'),H('f5',.03,'hussF'),('B',.6,'vibe'),
('S','s4'),('L',.1,'n4','n4'),('B',1.2,'sprint'),('L',0,'a_slept','a_slept'),('L',.25,'m_gta','m_gta'),('B',.25,'g0'),('L',0,'a_bro','a_bro'),('B',1.5,'shoes'),
('S','s5'),('L',.1,'n5','n5'),('B',.5,'bags'),('L',0,'a_what','a_what'),('L',.25,'my_talk','my_talk'),('B',1.4,'doze2'),('B',.45,'horn'),H('m1',0,'my_hussL'),H('m2',.1,'my_huss'),H('m3',.1,'my_hussL'),('B',1.3,'backout'),
('S','s6'),('L',.1,'n6','n6'),('B',.5,'bed'),('L',0,'j_delete','j_delete'),('B',1.4,'sleep'),('B',2.0,'enter'),('B',1.1,'horror'),('B',2.2,'approach'),
('S','s7'),('L',.1,'n7','n7'),('B',1.4,'reveal'),('B',2.2,'shave'),('B',.7,'mirror'),('L',0,'j_hair','j_hair'),('L',.3,'g_fifty','g_fifty'),('B',2.6,'photos'),
('S','s8'),('L',.1,'n8','n8'),H('h4',.1,'hussL'),H('h5',.12),H('h6',.12,'hussL'),('B',1.3,'asleep'),('B',.9,'morning'),('L',0,'g_money','g_money'),('B',.6,'look'),('L',0,'a_moving','a_moving'),('B',.05,'end')]
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
