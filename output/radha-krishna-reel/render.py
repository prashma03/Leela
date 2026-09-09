from pathlib import Path
import sys, math, subprocess, wave, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parent/'reel-deps'))
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
SOURCE=Path(r'C:\Users\ghimi\.codex\generated_images\01a08498-0849-70d0-98cf-21361c3839b1\exec-fe3e3176-a104-4fec-b507-9f1c2e92dd94.png')
shutil.copy2(SOURCE,ROOT/'story-art.png')
art=Image.open(SOURCE).convert('RGB')
W,H,FPS,D=720,1280,24,24
scenes=[art.crop((round(i*art.width/4)+2,0,round((i+1)*art.width/4)-2,art.height)) for i in range(4)]
title=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',48)
body=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',35)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',19)
captions=[('THE CALL OF LOVE',['At dusk, Radha heard a melody...','and her heart knew who was calling.']),('THROUGH VRINDAVAN',['She followed the flute through flowers,','until the forest opened to the river.']),('BESIDE THE YAMUNA',['There sat Krishna, smiling.','His melody had led her home.']),('RADHA & KRISHNA',['No words were needed.','Love had already spoken.'])]
shade=Image.new('RGBA',(W,H))
sa=np.zeros((H,W,4),dtype=np.uint8)
sa[:,:,:3]=[5,10,19]
sa[:,:,3]=(np.clip((np.arange(H)-750)/400,0,1)*215).astype(np.uint8)[:,None]
shade=Image.fromarray(sa)
rng=np.random.default_rng(17)
particles=rng.random((35,4))
def frame(t):
    i=min(3,int(t/6)); u=(t-i*6)/6
    zoom=1.02+.08*(u if i%2==0 else 1-u)
    src=scenes[i]; cw=src.width/zoom; ch=cw*H/W
    cx=src.width/2 + math.sin(u*math.pi)*src.width*.009
    cy=src.height*.48
    im=src.resize((W,H),Image.Resampling.LANCZOS,box=(cx-cw/2,max(0,cy-ch/2),cx+cw/2,min(src.height,cy+ch/2))).convert('RGBA')
    fx=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(fx)
    for a,b,c,d in particles:
        x=(a*W+math.sin(t*.35+b*8)*26)%W; y=(b*H-t*(12+c*16))%H
        radius=1+c*3; alpha=int(75+75*math.sin(t*1.3+d*8)**2)
        dr.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(255,219,145,alpha))
    im=Image.alpha_composite(Image.alpha_composite(im,fx),shade)
    layer=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(layer)
    def center(txt,y,font,color):
        dr.text((W/2,y),txt,font=font,fill=color,anchor='mt',stroke_width=1,stroke_fill=(0,0,0,90))
    center('A VRINDAVAN LOVE STORY',65,small,(255,234,193,230))
    heading,lines=captions[i]
    center(heading,950,title,(255,224,158,255))
    dr.line((310,1018,410,1018),fill=(255,216,139,220),width=2)
    for j,line in enumerate(lines): center(line,1045+j*49,body,(255,249,236,255))
    center('RADHE  •  RADHE',1180,small,(255,226,173,220))
    im=Image.alpha_composite(im,layer).convert('RGB')
    # Soft dips at chapter boundaries, with an opening and closing fade.
    factor=min(1,t/.6,(D-t)/.9)
    for cut in [6,12,18]: factor=min(factor,.30+.70*min(1,abs(t-cut)/.35))
    if factor<1: im=Image.blend(Image.new('RGB',(W,H)),im,max(0,factor))
    return im
# An original synthesized flute-like melody and a quiet sustained drone.
sr=44100; ts=np.arange(sr*D)/sr
song=.045*np.sin(2*np.pi*146.832*ts)+.025*np.sin(2*np.pi*220*ts)
notes=[62,65,67,69,67,65,62,60,62,67,69,72,69,67,65,62]
for n,midi in enumerate(notes):
    start=n*1.4+.5; length=1.22; pos=int(start*sr); count=min(int(length*sr),len(song)-pos)
    tt=np.arange(count)/sr; f=440*2**((midi-69)/12)
    env=np.minimum(tt/.12,1)*np.minimum((length-tt)/.27,1)
    phase=2*np.pi*f*tt+.025*np.sin(2*np.pi*5*tt)
    tone=env*(.22*np.sin(phase)+.034*np.sin(phase*2)+.013*np.sin(phase*3))
    song[pos:pos+count]+=tone
    delay=int(.24*sr)
    if pos+delay+count<len(song):song[pos+delay:pos+delay+count]+=.17*tone
song*=np.minimum(ts/1.2,1)*np.minimum((D-ts)/1.8,1)
with wave.open(str(ROOT/'soundtrack.wav'),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(sr)
    out.writeframes((np.stack([song,song],axis=1)*30000).astype('<i2').tobytes())
cmd=[FF,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-i',str(ROOT/'soundtrack.wav'),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(D),'-movflags','+faststart',str(ROOT/'radha-krishna-reel.mp4')]
with open(ROOT/'encode.log','w') as log:
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
    for k in range(D*FPS):
        proc.stdin.write(frame(k/FPS).tobytes())
        if k%144==0:print(f'Rendered {k/FPS:.0f}s',flush=True)
    proc.stdin.close()
    if proc.wait()!=0:raise RuntimeError('Encoding failed: see encode.log')
frame(20).save(ROOT/'cover.jpg',quality=94)
checks=Image.new('RGB',(W*4,H))
for i,t in enumerate([3,9,15,21]):checks.paste(frame(t),(i*W,0))
checks.thumbnail((1440,640));checks.save(ROOT/'preview.jpg')
print(str(ROOT/'radha-krishna-reel.mp4'))
