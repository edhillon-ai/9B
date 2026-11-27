import soundfile as sf, json, numpy as np, subprocess
from kokoro_onnx import Kokoro
k=Kokoro("/tmp/tts/kokoro-v1.0.onnx","/tmp/tts/voices-v1.0.bin")
NS=1.12
V={'alex':('am_puck',3.0,''),'jake':('am_liam',4.0,''),'grandma':('bf_lily',4.0,',vibrato=f=6.5:d=0.18'),'baker':('bm_lewis',3.5,''),'mailman':('am_echo',4.5,''),'mayor':('bm_george',3.5,''),
   'police':('am_michael',3.5,''),'robber':('am_fenrir',2.5,''),'customer':('am_santa',4.0,',vibrato=f=7:d=0.25'),'agent':('bm_fable',3.0,'')}
L=[
("n1","alex",NS,"In this town, nobody ever runs.",0),
("n1b","alex",NS,"Not even when they're being chased.",0),
("p_stop","police",1.0,"STOP RIGHT THERE!",1.0),
("r_nah","robber",0.8,"Nah.",0),
("n2","alex",NS,"One day, our mayor announced a race with a million dollar prize.",0),
("a_retire","alex",1.1,"BRO, IS THIS A RETIREMENT HOME?",1.5),
("g_mouth","grandma",1.0,"Watch your mouth, yo.",0),
("n3","alex",NS,"I realized that if I learned how to run, I'd become unstoppable.",0),
("huss","alex",1.0,"Huss!",0),
("hussL","alex",1.0,"HUSS!",1.5),
("a_btw","alex",1.05,"While they're out partying, by the way.",0),
("a_part","alex",1.0,"That was part of the workout.",0),
("n4","alex",NS,"The next day, I saw the mailman delivering a package.",0),
("a_run","alex",1.05,"Why don't you just run?",0),
("m_2014","mailman",1.05,"This package was supposed to arrive in twenty fourteen.",0),
("c_fin","customer",0.95,"FINALLY!",1.5),
("n5","alex",NS,"But when I started running through town, everyone panicked.",0),
("j_slow","jake",1.05,"BRO, SLOW DOWN!",1.5),
("g_speed","grandma",1.05,"GET YOUR MONEY UP, NOT YOUR SPEED UP, YO!",1.0),
("n6","alex",NS,"Then I noticed something following me.",0),
("a_why","alex",1.1,"WHY IS IT FOLLOWING ME?",1.5),
("n7","alex",NS,"And that's when I discovered why nobody ever ran.",0),
("v_cong","agent",1.05,"Congratulations! You've been selected for the town's delivery service.",0),
("a_what","alex",1.0,"WHAT?",2.0),
("m_12","mailman",1.0,"I've been waiting twelve years for this moment.",0),
("n8","alex",NS,"So instead of becoming a millionaire, I became the town's only delivery worker.",0),
("g_party","grandma",1.05,"While we're out partying, by the way!",1.0),
("a_unemp","alex",0.95,"I should've stayed unemployed.",0),
]
meta={}
for i,sp,spd,t,ex in L:
    v,semi,fx=V[sp]
    s,sr=k.create(t,voice=v,speed=spd)
    a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(0,idx[0]-200):idx[-1]+800]
    sf.write(f"audio/raw/{i}.wav",s,sr)
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",f"audio/raw/{i}.wav","-af",f"rubberband=pitch={2**((semi+ex)/12):.4f}{fx}","-ar","24000",f"audio/lines/{i}.wav"],check=True)
    s2,_=sf.read(f"audio/lines/{i}.wav"); meta[i]=dict(speaker=sp,text=t,dur=len(s2)/24000); print(i,round(meta[i]['dur'],2),end=' | ')
json.dump(meta,open("audio/lines/meta.json","w"),indent=1)
print('\ntotal',round(sum(m['dur'] for m in meta.values()),2))
