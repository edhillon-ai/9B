import soundfile as sf, json, numpy as np, subprocess, sys
from kokoro_onnx import Kokoro
k=Kokoro("/tmp/tts/kokoro-v1.0.onnx","/tmp/tts/voices-v1.0.bin")
NS=float(sys.argv[1]) if len(sys.argv)>1 else 1.2
# speaker -> (voice, semitones)
V={'alex':('am_puck',3.0),'jake':('am_liam',4.0),'mayor':('bm_george',3.0),'coach':('am_michael',2.0)}
L=[ # id, speaker, speed, text, extra semitones
("n1","alex",NS,"In this town, it's impossible to miss a basketball shot. Even our grandma shoots better than Steph Curry, and she's seventy-eight,",0),
("btw","alex",0.95,"by the way.",0),
("n2","alex",NS,"Our mailman delivered packages from half-court, our baker shot three-pointers with bread, and our mayor thought he was LeBron James.",0),
("n3","alex",NS,"But one day, our coach went on vacation, and my best friend Jake somehow missed a wide-open layup.",0),
("j_bro","jake",1.0,"Bro?",0),
("n4","alex",NS,"I saw this as an opportunity to become the greatest basketball player alive.",0),
("huss","alex",1.0,"Huss!",0),
("hussL","alex",1.0,"HUSS!",1.5),
("hussQ","alex",0.95,"huss.",-0.5),
("d4","alex",1.12,"While they're out partying, I'm out here grinding,",0),
("n5","alex",NS,"After twelve hours of training, I finally tested my new jumper.",0),
("n6","alex",NS,"Grandma went zero for thirty, the mailman got fired, and our mayor blamed the wind. We were indoors,",0),
("n7","alex",NS,"While I was grinding, Jake discovered a blinking light underneath his basketball.",0),
("j_wifi","jake",1.08,"Bro, why does my basketball need Wi-Fi?",0),
("j_stop","jake",1.0,"BRO, STOP!",2.5),
("n8","alex",NS,"We followed the signal into our coach's garage, and discovered something that changed everything.",0),
("n9","alex",NS,"Our coach had secretly controlled every basketball shot for twenty years. He literally gave the entire town aimbot.",0),
("n10","alex",NS,"When our coach returned, he admitted that he'd forgotten his controller charger on vacation.",0),
("m_lebron","mayor",1.08,"So I'm not better than LeBron?",2.0),
("c_dribble","coach",0.92,"You can't even dribble.",0),
("n11","alex",NS,"Once the coach plugged his controller back in, everyone became good at basketball again.",0),
("j_aimbot","jake",1.05,"BRO, THE AIMBOT IS ON!",2.5),
("d11","alex",1.0,"Still grinding,",0),
]
meta={}
for i,sp,spd,t,ex in L:
    v,semi=V[sp]
    s,sr=k.create(t,voice=v,speed=spd)
    a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(0,idx[0]-200):idx[-1]+800]
    sf.write(f"audio/raw/{i}.wav",s,sr)
    p=2**((semi+ex)/12)
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",f"audio/raw/{i}.wav","-af",f"rubberband=pitch={p:.4f}","-ar","24000",f"audio/lines/{i}.wav"],check=True)
    s2,_=sf.read(f"audio/lines/{i}.wav")
    meta[i]=dict(speaker=sp,text=t,dur=len(s2)/24000)
    print(i,round(meta[i]['dur'],2))
json.dump(meta,open("audio/lines/meta.json","w"),indent=1)
