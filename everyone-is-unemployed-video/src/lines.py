import soundfile as sf, json, numpy as np, subprocess
from kokoro_onnx import Kokoro
k=Kokoro("/tmp/tts/kokoro-v1.0.onnx","/tmp/tts/voices-v1.0.bin")
NS=1.12
V={'alex':('am_puck',3.0,''),'jake':('am_liam',4.0,''),'grandma':('bf_lily',4.0,',vibrato=f=6.5:d=0.18'),'baker':('bm_lewis',3.5,''),'mailman':('am_echo',4.5,''),'mayor':('bm_george',3.5,'')}
L=[
("n1","alex",NS,"In this town, everyone is unemployed, but somehow they're all millionaires.",0),
("n1b","alex",NS,"Everyone except me.",0),
("g_money","grandma",1.05,"GET YOUR MONEY UP, NOT YOUR FUNNY UP, YO!",1.0),
("n2","alex",NS,"So I decided to become the hardest-working person in town.",0),
("huss","alex",1.0,"Huss!",0),
("hussL","alex",1.0,"HUSS!",1.5),
("a_btw","alex",1.05,"While they're out partying, by the way.",0),
("a_bro","alex",1.0,"BRO, WHAT?",2.0),
("n3","alex",NS,"I asked the richest baker in town how he made his money.",0),
("a_cust","alex",1.08,"How many customers do you get every day?",0),
("b_zero","baker",1.0,"Zero.",0),
("a_how","alex",1.05,"Then how are you rich?",0),
("b_good","baker",1.0,"Good question.",0),
("n4","alex",NS,"Then I asked the mailman, who somehow owned seven mansions.",0),
("a_pkgs","alex",1.08,"How many packages have you delivered today?",0),
("m_none","mailman",1.08,"None. I lost the mail truck three years ago.",0),
("a_teach","alex",1.0,"TEACH ME YOUR WAYS!",2.0),
("n5","alex",NS,"I knew the mayor had to be hiding something.",0),
("a_howall","alex",1.08,"How does everyone have so much money?",0),
("my_hard","mayor",1.0,"Have you tried working harder?",0),
("a_done","alex",1.0,"I'M DONE!",2.0),
("n6","alex",NS,"But that night, I noticed something strange.",0),
("n6b","alex",NS,"Everyone was gathering outside Grandma's house.",0),
("g_nike","grandma",1.05,"Since when do bushes wear Nike?",0),
("n7","alex",NS,"And that's when I discovered how everyone was getting rich.",0),
("a_why","alex",1.05,"WHY AM I NOT GETTING ANY MONEY?",2.0),
("g_notif","grandma",1.0,"You turned your notifications off.",0),
("n8","alex",NS,"So I finally turned my notifications back on.",0),
("j_huss","jake",1.0,"Huss!",0),
("j_hussL","jake",1.0,"HUSS!",1.5),
("a_final","alex",1.08,"While you're out working, by the way!",1.0),
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
