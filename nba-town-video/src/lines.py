import soundfile as sf, json, numpy as np, sys
from kokoro_onnx import Kokoro
k=Kokoro("/tmp/tts/kokoro-v1.0.onnx","/tmp/tts/voices-v1.0.bin")
OUT=sys.argv[1]
A="am_puck"
# id, speaker, voice, speed, text
L=[
("n1","alex",A,1.26,"In this town, everyone wants to make the NBA."),
("n1b","alex",A,1.26,"And somehow, the best basketball player here, is a seventy-eight-year-old grandma."),
("n2","alex",A,1.26,"Our mailman delivered packages like basketballs."),
("n2b","alex",A,1.26,"And our baker thought he was Steph Curry."),
("n3","alex",A,1.26,"But one day, our mayor announced that Rudy Gobert was coming to recruit someone for an NBA team."),
("n4","alex",A,1.26,"So naturally, I started grinding."),
("n4b","alex",A,1.26,"My best friend Ben invited me to a party, but I had bigger plans."),
("huss","alex",A,1.0,"Huss!"),
("d4","alex",A,1.12,"While they're out partying, I'm out here grinding,"),
("btw","alex",A,0.95,"by the way."),
("n5","alex",A,1.26,"Meanwhile, Ben, the mailman, the baker, and even Grandma, were having the time of their lives."),
("n6","alex",A,1.26,"I trained so hard that I started dribbling while brushing my teeth, eating breakfast, and even using the bathroom."),
("d6","alex",A,1.12,"While they're out partying, I'm out here getting better,"),
("n7","alex",A,1.26,"When tournament day arrived, the mailman got his ankles broken, the baker airballed a layup, and our mayor somehow fouled himself."),
("n8","alex",A,1.26,"But Grandma was moving like she had a ninety-nine overall. She even dunked on the mayor without taking off her glasses."),
("g8","grandma","bf_lily",1.0,"Too small!"),
("n9","alex",A,1.26,"Eventually, I made it to the finals against Grandma. Seven days of grinding, had all come down to this."),
("hussq","alex",A,0.9,"huss."),
("n10","alex",A,1.26,"The game was tied, and with three seconds remaining, I finally got past Grandma. I thought my NBA career had officially begun."),
("g10","grandma","bf_lily",1.0,"Not in my house!"),
("n11","alex",A,1.26,"But when Rudy announced who he was recruiting, he didn't choose me, or Grandma. He chose Ben."),
("n11b","alex",A,1.26,"Apparently, Rudy wasn't recruiting a basketball player. He was recruiting a mascot."),
("d12","alex",A,1.0,"Should've gone to the party,"),
]
meta={}
for i,sp,v,spd,t in L:
    s,sr=k.create(t,voice=v,speed=spd)
    # trim silence
    a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(0,idx[0]-200):idx[-1]+800]
    sf.write(f"{OUT}/{i}.wav",s,sr); meta[i]=dict(speaker=sp,text=t,dur=len(s)/sr)
    print(i,round(len(s)/sr,2))
json.dump(meta,open(f"{OUT}/meta.json","w"),indent=1)
print("total narr", sum(m['dur'] for m in meta.values()))
