import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const name    = searchParams.get('name')    || 'Вечен Спомен';
  const years   = searchParams.get('years')   || '';
  const city    = searchParams.get('city')    || '';
  const family  = searchParams.get('family')  || '';
  const photo   = searchParams.get('photo')   || '';
  const message = searchParams.get('msg')     || '';

  return new ImageResponse(
    <div
      style={{
        background: '#faf9f7',
        width: '100%',
        height: '100%',
        display: 'flex',
        fontFamily: 'Georgia, serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner accents */}
      <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:'#f5f3f0', transform:'rotate(45deg) translate(50px,-50px)', display:'flex' }} />
      <div style={{ position:'absolute', bottom:0, left:0, width:100, height:100, background:'#f5f3f0', transform:'rotate(45deg) translate(-50px,50px)', display:'flex' }} />

      {/* Left — photo (36%) */}
      <div style={{ width:'36%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px 60px 60px' }}>
        <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {photo ? (
            <img
              src={photo}
              style={{ width:280, height:380, objectFit:'cover', border:'8px solid #ffffff', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', filter:'contrast(1.05) saturate(0.95)' }}
            />
          ) : (
            <div style={{ width:280, height:380, background:'#e7e5e4', display:'flex', alignItems:'center', justifyContent:'center', border:'8px solid #ffffff', boxShadow:'0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ width:60, height:60, background:'#d6d3d1', borderRadius:'50%', display:'flex' }} />
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width:1, background:'#e7e5e4', margin:'60px 0', display:'flex' }} />

      {/* Right — content (64%) */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 60px 60px 48px', gap:0 }}>

        {/* Label */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div style={{ width:40, height:2, background:'#d6d3d1', display:'flex' }} />
          <span style={{ fontSize:11, letterSpacing:5, color:'#a8a29e', textTransform:'uppercase', fontFamily:'Georgia, serif' }}>
            Во Вечен Спомен
          </span>
        </div>

        {/* Name */}
        <div style={{ fontSize:62, color:'#1c1917', lineHeight:1.15, fontWeight:'normal', marginBottom:12, fontFamily:'Georgia, serif' }}>
          {name}
        </div>

        {/* Years */}
        {years && (
          <div style={{ fontSize:24, color:'#78716c', letterSpacing:4, marginBottom:8, fontFamily:'Georgia, serif', fontWeight:'300' }}>
            {years}
          </div>
        )}

        {/* City */}
        {city && (
          <div style={{ fontSize:13, letterSpacing:3, color:'#a8a29e', textTransform:'uppercase', marginBottom:28, fontFamily:'Georgia, serif' }}>
            {city}
          </div>
        )}

        {/* Divider line */}
        <div style={{ width:'100%', height:1, background:'#e7e5e4', marginBottom:24, display:'flex' }} />

        {/* Message preview */}
        {message && (
          <div style={{ fontSize:22, color:'#57534e', fontStyle:'italic', lineHeight:1.5, marginBottom:24, display:'-webkit-box', WebkitLineClamp:2, overflow:'hidden', fontFamily:'Georgia, serif' }}>
            „{message}"
          </div>
        )}

        {/* Family note + branding */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'auto' }}>
          {family && (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <span style={{ fontSize:10, letterSpacing:3, color:'#a8a29e', textTransform:'uppercase', fontFamily:'Georgia, serif' }}>
                Со љубов и почит од:
              </span>
              <span style={{ fontSize:26, color:'#1c1917', fontFamily:'Georgia, serif', fontWeight:'normal' }}>
                {family}
              </span>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
            <span style={{ fontSize:10, letterSpacing:2, color:'#a8a29e', textTransform:'uppercase' }}>Објавено на</span>
            <span style={{ fontSize:18, color:'#44403c', letterSpacing:1, fontWeight:'bold', textTransform:'uppercase' }}>
              VECENSPOMEN.MK
            </span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
