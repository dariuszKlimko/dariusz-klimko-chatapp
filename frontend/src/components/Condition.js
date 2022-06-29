import { useContext } from 'react';
import '../App.css';
import Button from '../components/Button'
import ConditionContext from '../contexts/CondidionContext';
import DiscardContext from '../contexts/DiscardContext';


function Condition() {

  const [condition, setCondition] = useContext(ConditionContext)
  const [discard, setDiscard] = useContext(DiscardContext)

  const handleGotIt = () =>{
    setCondition(true)
    setDiscard(true)
  }

  const handleDiscard = () =>{
    setCondition(true)
    setDiscard(false)
  }
// --------------------------------------------------------------------------------------------------
  return (
    <div className='condition'>
      <div style={{padding:'10px'}}>Your tel. number will be use only for verification purpose.</div>
      <div style={{padding:'10px'}}>
        <Button
          label={'got it'}
          color={'success'}
          onClick={handleGotIt}
        />
        &nbsp;&nbsp;&nbsp;
        <Button
          label={'discard'}
          color={'error'}
          onClick={handleDiscard}
        />
      </div>
    </div>
  );
}

export default Condition;