import './Progress.css';


function Progress(props) {
  return (
    <div>
      <div style={{paddingTop:'25%'}}>
        <div className='name'>{props.name}</div>
        <br/>
        <div className='tel'>{props.tel}</div>
      </div>
      <br/><br/><br/>
      <div className='container'>
        <div className='ball1'></div>
        <div className='space'/>
        <div className='ball2'></div>
        <div className='space'/>
        <div className='ball3'></div>
        <div className='space'/>
        <div className='ball4'></div>
      </div>
    </div>
  );
}

export default Progress;