import pdf from '../fileType/pdf-file-icon-11_vc97xw.png'
import docx from '../fileType/docx-01-512_tgfu78.png'
import doc from '../fileType/doc-icon-5_vbzktl.png'
import xls from '../fileType/xls-01-512_tp1jau.png'
import csv from '../fileType/csv-icon-11_blmz5t.png'
import mp4 from '../fileType/mp4-icon-12_kfhbjr.png'
import mp3 from '../fileType/mp3-icon-png-9_udv70s.png'

function FileType({type, link, cssClass}) {
  return (  
    <div className={cssClass}>
      {(type==='png'||type==='jpg'|| type==='jpeg'|| type==='gif'|| type==='bmp')&&<img src={link} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='pdf')&&<img src={pdf} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='xls')&&<img src={xls} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='docx')&&<img src={docx} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='doc')&&<img src={doc} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='csv')&&<img src={csv} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='mp3')&&<img src={mp3} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
      {(type==='mp4')&&<img src={mp4} alt='image review' width='100%' height='100%'  style={{objectFit:'contain'}}/>}
    </div>
  );
}
  
export default FileType;
