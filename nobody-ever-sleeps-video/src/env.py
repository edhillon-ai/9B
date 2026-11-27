import json, numpy as np, soundfile as sf
T=json.load(open('timeline.json')); out={}
for l in T['lines']:
    s,sr=sf.read(f"audio/lines/{l['id']}.wav"); hop=sr/30
    e=np.array([np.sqrt(np.mean(s[int(i*hop):int((i+1)*hop)]**2)) for i in range(int(len(s)/hop))]+[0])
    e=np.clip(e/(np.percentile(e,95)+1e-6),0,1); out[l['name']]=[round(float(x),2) for x in e]
json.dump(out,open('env.json','w')); print(len(out))
