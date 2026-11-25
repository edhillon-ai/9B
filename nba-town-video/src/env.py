import json, numpy as np, soundfile as sf
T=json.load(open('timeline.json'))
GR=0.93
out={}
for l in T['lines']:
    s,sr=sf.read(f"audio/lines/{l['id']}.wav")
    if l['speaker']=='grandma':  # resample to lower pitch/slower
        n=int(len(s)/GR); s=np.interp(np.linspace(0,len(s)-1,n),np.arange(len(s)),s)
    hop=sr/30; fr=int(len(s)/hop)+1; e=[]
    for i in range(fr):
        seg=s[int(i*hop):int((i+1)*hop)]
        e.append(float(np.sqrt(np.mean(seg**2))) if len(seg) else 0)
    e=np.array(e); e=np.clip(e/ (np.percentile(e,95)+1e-6),0,1)
    out[l['name']]=[round(float(x),2) for x in e]
json.dump(out,open('env.json','w'))
print(len(out))
