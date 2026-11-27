import json
M=json.load(open('audio/lines/meta.json')); dur=lambda i:M[i]['dur']
H=lambda nm,g=.1,v='huss':('L',g,v,nm)
TGT={'s1':10,'s2':10.8,'s3':10.8,'s4':10.8,'s5':11.8,'s6':11.4,'s7':14.2,'s8':10.2}
P=[('S','s1'),('L',.1,'n1','n1'),('B',.15,'n1x'),('L',0,'n1b','n1b'),('B',1.4,'chase'),('L',0,'p_stop','p_stop'),('L',.3,'r_nah','r_nah'),('B',1.9,'same'),('B',1.5,'stare'),
('S','s2'),('L',.1,'n2','n2'),('B',1.4,'gather'),('B',.9,'whistle'),('B',1.5,'slow'),('L',0,'a_retire','a_retire'),('L',.3,'g_mouth','g_mouth'),('B',2.3,'win'),
('S','s3'),('L',.1,'n3','n3'),H('h1',.15,'hussL'),H('h2',.12),H('h3',.12,'hussL'),('L',.25,'a_btw','a_btw'),('B',1.4,'party'),('B',1.7,'fly'),('L',0,'a_part','a_part'),('B',.4,'s3x'),
('S','s4'),('L',.1,'n4','n4'),('B',1.2,'slowmail'),('L',0,'a_run','a_run'),('L',.3,'m_2014','m_2014'),('B',1.5,'open'),('L',0,'c_fin','c_fin'),('B',1.2,'shake'),
('S','s5'),('L',.1,'n5','n5'),('B',.9,'bread'),('B',.9,'trash'),('L',0,'j_slow','j_slow'),H('h4',.12,'hussL'),H('h5',.12),H('h6',.12,'hussL'),('B',.9,'pullup'),('L',0,'g_speed','g_speed'),('B',1.2,'ignore'),
('S','s6'),('L',.1,'n6','n6'),('B',1.7,'van'),('B',1.4,'accel'),('L',0,'a_why','a_why'),('B',1.5,'montage'),H('h7',.1,'hussL'),H('h8',.12),H('h9',.12,'hussL'),('B',1.2,'catch'),('B',1.4,'door'),
('S','s7'),('L',.1,'n7','n7'),('B',1.5,'manout'),('L',0,'v_cong','v_cong'),('L',.2,'a_what','a_what'),('B',1.1,'recruit'),('B',2.0,'dump'),('L',0,'m_12','m_12'),('B',2.3,'lambo'),
('S','s8'),('L',.1,'n8','n8'),H('h10',.1,'hussL'),H('h11',.1),H('h12',.1,'hussL'),('L',.2,'g_party','g_party'),('B',.8,'drop'),('L',0,'a_unemp','a_unemp'),('B',.05,'end')]
# per-scene scale
sc={};cur=None
for x in P:
    if x[0]=='S': cur=x[1]; sc[cur]=[0,0]
    elif x[0]=='L': sc[cur][0]+=dur(x[2]); sc[cur][1]+=x[1]
    else: sc[cur][1]+=x[1]
K={s:(TGT[s]-a)/b for s,(a,b) in sc.items()}
print({s:round(v,2) for s,v in K.items()})
t=0;ev={};lines=[];scenes={};cur=None
for x in P:
    if x[0]=='S':
        if cur: scenes[cur][1]=t
        cur=x[1];scenes[cur]=[t,None];k=K[cur]
    elif x[0]=='L':
        t+=x[1]*k; d=dur(x[2]); lines.append(dict(id=x[2],name=x[3],speaker=M[x[2]]['speaker'],text=M[x[2]]['text'],start=round(t,3),dur=round(d,3))); ev[x[3]]=[round(t,3),round(t+d,3)]; t+=d
    else: ev[x[2]]=[round(t,3),round(t+x[1]*k,3)]; t+=x[1]*k
scenes[cur][1]=t
for s,r in scenes.items(): print(s,[round(v,2) for v in r])
json.dump(dict(lines=lines,ev=ev,scenes=scenes,total=90.0),open('timeline.json','w'),indent=1)
print(' '.join(f'{a}:{b[0]:.2f}-{b[1]:.2f}' for a,b in ev.items()))
