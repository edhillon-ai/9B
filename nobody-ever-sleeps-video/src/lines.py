import soundfile as sf, json, numpy as np, subprocess
from kokoro_onnx import Kokoro
k=Kokoro("/tmp/tts/kokoro-v1.0.onnx","/tmp/tts/voices-v1.0.bin")
NS=1.12
V={'alex':('am_puck',3.0,''),'jake':('am_liam',4.0,''),'grandma':('bf_lily',4.0,',vibrato=f=6.5:d=0.18'),'baker':('bm_lewis',3.5,''),'mailman':('am_echo',4.5,''),'mayor':('bm_george',3.5,'')}
L=[
("n1","alex",NS,"In this town, nobody ever sleeps.",0),
("n1b","alex",NS,"And if you fall asleep, something terrible happens to you.",0),
("g_sleep","grandma",1.05,"SLEEP IS FOR THE UNEMPLOYED!",1.0),
("n2","alex",NS,"So I decided to train myself to never sleep again.",0),
("huss","alex",1.0,"Huss!",0),
("hussL","alex",1.0,"HUSS!",1.5),
("a_btw","alex",1.05,"While they're out partying, by the way.",0),
("a_awake","alex",1.1,"I'M AWAKE! I'M AWAKE!",2.0),
("n3","alex",NS,"I asked the baker how he managed to stay awake for forty-seven years.",0),
("a_coffee","alex",1.05,"How much coffee do you drink?",0),
("b_yes","baker",1.0,"Yes.",0),
("hussF","alex",1.35,"Huss!",2.5),
("n4","alex",NS,"Then I noticed the mailman was acting suspicious.",0),
("a_slept","alex",1.05,"When was the last time you slept?",0),
("m_gta","mailman",1.05,"Before G T A five came out.",0),
("a_bro","alex",1.0,"BRO!",2.0),
("n5","alex",NS,"So I went to the mayor to find out what actually happened when someone fell asleep.",0),
("a_what","alex",1.05,"What happens if I fall asleep?",0),
("my_talk","mayor",0.95,"We don't talk about that.",0),
("my_huss","mayor",1.0,"Huss!",1.0),
("my_hussL","mayor",1.0,"HUSS!",2.0),
("n6","alex",NS,"That night, Jake and I decided to find out for ourselves.",0),
("j_delete","jake",1.05,"If I disappear, delete my search history.",0),
("n7","alex",NS,"And that's when I finally discovered why nobody ever slept.",0),
("j_hair","jake",1.05,"MY HAIRLINE!",2.5),
("g_fifty","grandma",1.0,"That'll be fifty dollars, yo.",0),
("n8","alex",NS,"After that, I promised myself I'd never sleep again.",0),
("g_money","grandma",1.05,"GET YOUR MONEY UP, NOT YOUR FUNNY UP, YO!",1.0),
("a_moving","alex",0.95,"I'm moving towns.",0),
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
