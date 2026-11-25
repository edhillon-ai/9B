import json
M=json.load(open('audio/lines/meta.json'))
GR=0.93  # grandma pitch/speed factor (slower+lower)
def dur(i): return M[i]['dur']/(GR if M[i]['speaker']=='grandma' else 1)
# items: ('L',gap,lineid,name) line ; ('B',secs,name) beat ; ('S',scene) scene start
P=[('S','s1'),('L',.25,'n1','n1'),('L',.2,'n1b','n1b'),('B',.6,'s1end'),
('S','s2'),('L',.15,'n2','n2'),('B',.7,'crash'),('L',0,'n2b','n2b'),('B',1.0,'bonk'),
('S','s3'),('L',.15,'n3','n3'),('B',1.6,'rudyTall'),
('S','s4'),('L',.15,'n4','n4'),('L',.25,'n4b','n4b'),('B',.35,'garage'),
 ('L',0,'huss','h1'),('L',.17,'huss','h2'),('L',.17,'huss','h3'),('L',.35,'d4','d4'),('L',.28,'btw','btw4'),('B',.5,'s4end'),
('S','s5'),('L',.15,'n5','n5'),('B',.35,'dumb'),('L',0,'huss','h4'),('L',.17,'huss','h5'),('L',.17,'huss','h6'),('B',.8,'awk5'),
('S','s6'),('L',.15,'n6','n6'),('L',.45,'d6','d6'),('L',.28,'btw','btw6'),('B',.5,'s6end'),
('S','s7'),('L',.15,'n7','n7'),('B',1.3,'rudySad'),
('S','s8'),('L',.15,'n8','n8'),('L',.25,'g8','g8'),('B',1.1,'mayorFloor'),
('S','s9'),('L',.15,'n9','n9'),('L',.35,'hussq','q1'),('L',.3,'hussq','q2'),('L',.3,'hussq','q3'),('B',1.7,'cookie'),
('S','s10'),('L',.1,'n10','n10'),('B',1.0,'block'),('L',0,'g10','g10'),('B',.5,'s10end'),
('S','s11'),('L',.2,'n11','n11'),('L',.3,'n11b','n11b'),('B',.9,'s11end'),
('S','s12'),('B',2.4,'ending'),('L',0,'d12','d12'),('L',.3,'btw','btw12'),('B',.6,'sit'),('B',1.0,'black')]
fixed=sum(dur(x[2]) for x in P if x[0]=='L')
flex=sum(x[1] for x in P if x[0]=='L')+sum(x[1] for x in P if x[0]=='B')
k=(90.0-fixed)/flex
print('fixed',fixed,'flex',flex,'scale',k)
t=0;ev={};lines=[];scenes={};cur=None
for x in P:
    if x[0]=='S':
        if cur: scenes[cur][1]=t
        cur=x[1];scenes[cur]=[t,None]
    elif x[0]=='L':
        t+=x[1]*k; d=dur(x[2]); lines.append(dict(id=x[2],name=x[3],speaker=M[x[2]]['speaker'],text=M[x[2]]['text'],start=round(t,3),dur=round(d,3)))
        ev[x[3]]=[round(t,3),round(t+d,3)]; t+=d
    else:
        ev[x[2]]=[round(t,3),round(t+x[1]*k,3)]; t+=x[1]*k
scenes[cur][1]=t
print('end',t); [print(s,[round(v,2) for v in r]) for s,r in scenes.items()]
json.dump(dict(lines=lines,ev=ev,scenes=scenes,total=90.0),open('timeline.json','w'),indent=1)
