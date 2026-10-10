// Original procedural materials. No image requests, assets, or GPU extensions required.
export const surfaceVertex=`
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;
uniform mat4 uModel;
uniform mat4 uVP;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec2 vUV;
void main(){vec4 p=uModel*vec4(aPosition,1.);vWorld=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vLocal=aPosition;vUV=aUV;gl_Position=uVP*p;}
`;
const noise=`
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .53*noise(p)+.27*noise(p*2.03)+.13*noise(p*4.07)+.07*noise(p*8.11);}
`;
export const surfaceFragment=`
precision highp float;
varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;varying vec2 vUV;
uniform vec3 uEye;uniform vec3 uSun;uniform vec3 uCenter;
uniform float uKind;uniform float uTime;uniform float uRadius;
uniform sampler2D uEarth;
${noise}
void main(){
 vec3 n=normalize(vNormal),p=normalize(vLocal),light=normalize(uSun-vWorld),view=normalize(uEye-vWorld);
 float rawLight=dot(n,light),diffuse=max(rawLight,0.);float fine=fbm(p*30.),broad=fbm(p*6.);vec3 color=vec3(.5);float ocean=0.,cloud=0.;
 if(uKind<.5){
  float plasma=fbm(p*16.+vec3(0.,uTime*.07,0.));float cells=noise(p*85.);float grain=mix(plasma,cells,.2);
  color=mix(vec3(1.,.28,.035),vec3(1.,.88,.43),smoothstep(.2,.82,grain));float edge=max(dot(n,view),0.);color*=.77+.23*edge;
  gl_FragColor=vec4(color,1.);return;
 }
 else if(uKind<1.5||uKind>8.5){
  float crater=0.;for(int k=0;k<3;k++){float scale=13.+float(k)*15.;vec3 cell=p*scale;vec3 id=floor(cell);vec3 f=fract(cell)-.5;float h=hash(id);float r=length(f);float bowl=1.-smoothstep(.17,.34,r);float rim=exp(-pow((r-.34)*26.,2.));crater+=(bowl*-.11+rim*.12)*step(.58,h);}
  float tone=.30+broad*.3+fine*.13+crater;float maria=smoothstep(.36,.58,fbm(p*4.+7.));if(uKind>8.5)tone-=maria*.17;
  color=vec3(tone)*(uKind<1.5?vec3(1.05,1.,.92):vec3(.96,.99,1.04));
 }
 else if(uKind<2.5){float flow=fbm(p*7.+vec3(fbm(p*4.)*2.,0.,0.));float stripes=.5+.5*sin(p.y*37.+flow*8.);color=mix(vec3(.58,.37,.17),vec3(.93,.82,.58),.34+flow*.43+stripes*.18);}
 else if(uKind<3.5){
  color=texture2D(uEarth,vUV).rgb;ocean=step(color.g,color.b)*step(color.r,color.b);
  float clouds=fbm(p*11.+vec3(uTime*.018,0.,0.));float curl=fbm(p*27.+clouds*4.);cloud=smoothstep(.53,.69,clouds*.75+curl*.25);
  color=mix(color,vec3(.93,.96,1.),cloud*.91);float ice=smoothstep(.91,.99,abs(p.y));color=mix(color,vec3(.87,.92,.96),ice);
 }
 else if(uKind<4.5){float terrain=fbm(p*8.),dark=smoothstep(.37,.56,terrain);color=mix(vec3(.58,.31,.18),vec3(.34,.21,.15),dark*.74);color+=vec3(.1,.055,.028)*fine;float poles=smoothstep(.91,.98,abs(p.y)+noise(p*33.)*.03);color=mix(color,vec3(.82,.78,.69),poles);}
 else if(uKind<6.5){
  float turbulence=fbm(p*9.)*.85+noise(p*24.)*.15;float latitude=p.y*(uKind<5.5?52.:32.)+turbulence*(uKind<5.5?2.7:.9)+sin(atan(p.z,p.x)*7.+p.y*9.)*.22;
  float stripe=.5+.5*sin(latitude),detail=.5+.5*sin(latitude*2.7+turbulence*3.);float belt=smoothstep(.25,.85,stripe);
  if(uKind<5.5){color=mix(vec3(.50,.33,.24),vec3(.88,.79,.63),belt);color=mix(color,vec3(.80,.63,.44),detail*.19);float dx=atan(p.z,p.x)-.5;float storm=exp(-(dx*dx*24.+pow(p.y+.23,2.)*180.));float curl=.5+.5*sin(length(vec2(dx*2.5,(p.y+.23)*7.))*17.+turbulence*5.);color=mix(color,mix(vec3(.62,.28,.16),vec3(.87,.60,.39),curl),storm*.85);}
  else{color=mix(vec3(.70,.62,.47),vec3(.91,.84,.66),.44+belt*.32);color+=detail*.025;}
 }
 else if(uKind<7.5){float bands=.5+.5*sin(p.y*26.+broad*2.);color=mix(vec3(.43,.65,.67),vec3(.62,.79,.79),.5+bands*.15);}
 else{float bands=.5+.5*sin(p.y*31.+broad*3.);color=mix(vec3(.19,.33,.55),vec3(.39,.55,.75),.4+bands*.3);float storm=exp(-pow(p.y+.32,2.)*210.-pow(atan(p.z,p.x)+.8,2.)*32.);color*=1.-storm*.3;}
 float lighting=.045+diffuse*.95;
 float limb=pow(1.-max(dot(n,view),0.),3.);vec3 rim=vec3(.0);
 if(uKind>2.5&&uKind<3.5){rim=vec3(.15,.32,.60)*limb*pow(max(rawLight+.35,0.),2.)*.65;}
 // Ring shadow on Saturn's surface, in the body's local frame.
 if(uKind>5.5&&uKind<6.5){vec3 plane=vec3(0.,cos(.466),sin(.466));vec3 rel=vWorld-uCenter;float den=dot(light,plane);float t=-dot(rel,plane)/(den+(den>=0.?.00001:-.00001));vec3 hit=(rel+light*t)/uRadius;float rr=length(hit);float shadow=step(0.,t)*step(1.32,rr)*step(rr,2.34);lighting*=1.-shadow*.65;}
 color*=lighting;
 if(ocean>.5){float spec=pow(max(dot(reflect(-light,n),view),0.),42.)*diffuse*(1.-cloud);color+=vec3(.45,.53,.67)*spec*.65;}
 if(uKind>2.5&&uKind<3.5){float cities=pow(noise(p*220.),22.)*step(.5,noise(p*45.))*(1.-ocean);color+=vec3(.9,.58,.22)*cities*(1.-smoothstep(-.22,.12,rawLight))*.22;}
 color+=rim;
 // Soft filmic mapping, preserving a dark nightside.
 color=pow(max(color,vec3(0.)),vec3(.85));gl_FragColor=vec4(color,1.);
}
`;
export const atmosphereFragment=`
precision highp float;
varying vec3 vWorld;varying vec3 vNormal;uniform vec3 uEye;uniform vec3 uSun;uniform vec3 uTint;
void main(){vec3 n=normalize(vNormal);float rim=pow(1.-max(dot(n,normalize(uEye-vWorld)),0.),4.);float light=max(dot(n,normalize(uSun-vWorld))+.25,0.);gl_FragColor=vec4(uTint,rim*light*.35);}
`;
export const ringFragment=`
precision highp float;
varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;uniform vec3 uSun;uniform vec3 uCenter;uniform float uRadius;uniform float uDetail;
void main(){float r=length(vLocal.xz);float bands=.5+.5*sin(r*80.*uDetail)*.5+.25*sin(r*170.*uDetail);float gap=1.-smoothstep(.017,.047,abs(r-1.95));float inner=smoothstep(1.24,1.45,r);float outer=1.-smoothstep(2.29,2.38,r);vec3 color=mix(vec3(.37,.32,.25),vec3(.76,.68,.52),bands);color=mix(color,vec3(.88,.80,.64),smoothstep(1.48,1.65,r)*.4);vec3 light=normalize(uSun-vWorld);vec3 rel=vWorld-uCenter;float along=dot(-rel,light);float nearest=length(rel+light*along);float shadow=step(0.,along)*(1.-smoothstep(uRadius*.94,uRadius*1.02,nearest));float lighting=.31+.65*abs(dot(normalize(vNormal),light));color*=lighting*(1.-shadow*.9);gl_FragColor=vec4(pow(color,vec3(.9)),(.55+bands*.3)*inner*outer*(1.-gap*.9));}
`;
export const glowVertex=`
attribute vec3 aPosition;attribute vec2 aUV;uniform mat4 uVP;uniform vec3 uCenter;uniform vec3 uRight;uniform vec3 uUp;uniform float uRadius;varying vec2 vUV;
void main(){vUV=aUV;vec3 p=uCenter+(uRight*aPosition.x+uUp*aPosition.y)*uRadius;gl_Position=uVP*vec4(p,1.);}
`;
export const glowFragment=`
precision mediump float;varying vec2 vUV;uniform float uTime;
void main(){vec2 p=(vUV-.5)*2.;float d=length(p);float angle=atan(p.y,p.x);float rays=(.5+.5*sin(angle*13.+sin(angle*31.)*.3+uTime*.03));float halo=exp(-d*5.)*.28+exp(-d*12.)*.45;float corona=exp(-pow((d-.205)*8.,2.))*.10;float fade=1.-smoothstep(.65,1.,d);vec3 c=mix(vec3(.76,.31,.09),vec3(1.,.78,.38),exp(-d*5.));float intensity=(halo+corona*rays)*fade;gl_FragColor=vec4(c*intensity,intensity);}
`;
export const lineVertex=`attribute vec3 aPosition;attribute float aAlpha;uniform mat4 uVP;uniform vec3 uOffset;varying float vAlpha;void main(){vAlpha=aAlpha;gl_Position=uVP*vec4(aPosition-uOffset,1.);}`;
export const lineFragment=`precision mediump float;uniform vec3 uColor;uniform float uOpacity;varying float vAlpha;void main(){gl_FragColor=vec4(uColor,uOpacity*vAlpha);}`;
export const starVertex=`attribute vec3 aPosition;attribute vec3 aColor;attribute float aSize;uniform mat4 uVP;uniform float uDPR;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uVP*vec4(aPosition,1.);gl_PointSize=aSize*uDPR;}`;
export const starFragment=`precision mediump float;varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5)*2.;float a=exp(-d*d*5.)*(1.-smoothstep(.75,1.,d));gl_FragColor=vec4(vColor,a*.85);}`;
export function makeEarthTexture(gl){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Canvas 2D textures are unavailable.');
 const ocean=ctx.createLinearGradient(0,0,0,512);ocean.addColorStop(0,'#59799c');ocean.addColorStop(.3,'#315b82');ocean.addColorStop(.6,'#214d78');ocean.addColorStop(1,'#406286');ctx.fillStyle=ocean;ctx.fillRect(0,0,1024,512);
 const continents=[
 [[-168,66],[-151,71],[-129,70],[-120,60],[-104,69],[-81,74],[-61,58],[-55,51],[-67,44],[-79,34],[-81,24],[-87,21],[-97,16],[-106,22],[-113,30],[-122,39],[-129,50],[-142,60]],
 [[-81,12],[-72,10],[-61,9],[-51,4],[-35,-6],[-40,-20],[-53,-32],[-63,-42],[-68,-55],[-74,-47],[-74,-29],[-80,-5]],
 [[-18,35],[-6,36],[11,37],[23,33],[33,31],[43,12],[51,11],[43,-10],[35,-22],[28,-34],[19,-35],[12,-20],[8,-5],[-4,4],[-15,12],[-17,24]],
 [[-10,36],[-9,44],[-2,49],[-5,58],[7,58],[12,65],[23,71],[31,68],[30,60],[45,65],[62,70],[89,74],[110,72],[129,68],[147,62],[167,66],[179,59],[165,52],[149,47],[141,37],[130,33],[121,21],[110,16],[105,7],[100,3],[96,19],[86,22],[80,8],[73,20],[66,25],[58,26],[49,12],[42,15],[35,31],[27,41],[17,39],[15,45],[9,44],[4,43],[-1,36]],
 [[112,-11],[128,-13],[136,-12],[145,-18],[153,-28],[150,-38],[139,-39],[130,-33],[114,-35],[113,-24]],
 [[-52,59],[-44,62],[-24,74],[-21,82],[-46,83],[-59,75]],
 [[47,-13],[51,-16],[48,-25],[44,-24]],
 [[129,31],[133,34],[141,41],[145,44],[141,36]],
 [[95,5],[104,-5],[117,-8],[129,-4],[141,-5],[149,-9],[133,-10],[115,-8],[103,-3]],
 [[166,-34],[178,-40],[172,-46],[165,-44]],
 [[-180,-72],[-140,-75],[-90,-73],[-60,-64],[-40,-75],[0,-70],[50,-69],[90,-66],[130,-70],[180,-73],[180,-90],[-180,-90]]
 ];
 const land=ctx.createLinearGradient(0,40,0,470);land.addColorStop(0,'#a4b1a5');land.addColorStop(.3,'#7d9175');land.addColorStop(.47,'#a99a73');land.addColorStop(.57,'#68866d');land.addColorStop(.72,'#8b9277');land.addColorStop(1,'#d0d6d1');ctx.fillStyle=land;
 ctx.beginPath();for(const poly of continents){poly.forEach(([lon,lat],i)=>{const x=(lon+180)/360*1024,y=(90-lat)/180*512;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.fill();ctx.save();ctx.clip();
 let seed=71;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<22000;i++){const bright=rand()>.5;ctx.fillStyle=bright?'#e6d5a510':'#19342113';ctx.fillRect(rand()*1024,rand()*512,rand()*3+1,rand()*2+1);}ctx.restore();
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D);return texture;
}
