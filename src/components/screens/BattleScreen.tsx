import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { increment, switchMode } from '../../redux/slices/dialogSlice';
import { useGetPokemonByNameQuery } from '../../redux/pokemonService';
import { RootState } from '../../redux/store';

import Dialog from '../gameMechanics/Dialog';
import professorOak from '../../assets/professorOak.png';
import { getBattleContainerStyle, getOakStyle, getMewStyle, getPlayerPokemonStyle, getHPContainerStyle, getHPBarStyle, getHPFillStyle } from '../../Styles/battleScreenStyle';


export default function BattleScreen() {
const dispatch = useDispatch();
const { data, error, isLoading, isFetching } = useGetPokemonByNameQuery('mew', {});
const starterPokemonState = useSelector((state: RootState) => state.player.starterPokemon);
const { index: dialogIndex, mode: dialogMode } = useSelector((state: RootState) => state.dialog);

const [takenDmg, setTakenDmg] = useState(false);
const [mewState, setMewState] = useState({ HP: 100, takenDmg: false, show: false });

const [oakPos, setOakPos] = useState({
leftPos: '-10%',
oakOpacity: '100%',
hide: false
});

const [playerPokemonStyle, setPlayerPokemonStyle] = useState({ opacity: '0%' });

useEffect(() => {
dispatch(switchMode('battle'));
setTimeout(() => {
setOakPos({ ...oakPos, leftPos: '80%' });
}, 1000);
}, []);



  useEffect(() => {
    switch (dialogIndex) {
      case 1:
        handleBattleStart();
        break;

      case 2:
        handlePokemonThrowOut();
        break;

      case 4:
        handleChooseAttack();
        break;

      case 5:
        handleHpDecrement();
        break;

      case 6:
        handleBattleEnd();
        break;
    }
  }, [dialogIndex]);

  function handleBattleStart() {
    // Battle starts: fade out Professor Oak and fade in Mew
    setOakPos({ ...oakPos, oakOpacity: '0%' });
    setTimeout(() => {
      setOakPos({ ...oakPos, hide: true });
      setMewState({ ...mewState, show: true });
    }, 1200);
  }

  function handlePokemonThrowOut() {
    // Player throws out their Pokémon and set its opacity to 100%
    setTimeout(() => {
      setPlayerPokemonStyle({ ...playerPokemonStyle, opacity: '100%' });
      dispatch(increment());
    }, 1600);
  }

  function handleChooseAttack() {
    // Player chooses a move to attack with
    let i = 0; // keep track of how many times the enemy blinks after getting attacked
    let mainTimeout = setTimeout(() => {
      let mainInterval = setInterval(() => {
        setTakenDmg(true);
        setMewState({ ...mewState, takenDmg: true });
        let flashingInterval = setTimeout(() => {
          if (i == 13) {
            // After flashing 13 times, clear timeouts/intervals and increment dialog
            setTakenDmg(false);
            clearTimeout(mainTimeout);
            clearInterval(mainInterval);
            clearInterval(flashingInterval);
            dispatch(increment());
          }
          i++;
          setMewState({ ...mewState, takenDmg: false });
          setTakenDmg(false);
        }, 100);
      }, 100);
    }, 1600);
  }

  function handleHpDecrement() {
    // Enemy takes damage and HP decrements slowly
    let j = 100;
    let subtractHP = setInterval(() => {
      if (j == 0) {
        // Once enemy's HP reaches 0, proceed to next stage by incrementing dialog
        let delayedHPDrop = setTimeout(() => {
          clearInterval(subtractHP);
          dispatch(increment());
        }, 2000);
      }
      setMewState({ ...mewState, HP: j });
      j--;
    }, 10);
  }

  function handleBattleEnd() {
    // Hide Mew
    setMewState({ ...mewState, show: false });
  }
  

  
  const styles = {
    battleContainer: getBattleContainerStyle(),
    oak: getOakStyle(oakPos),
    mew: getMewStyle(mewState),
    playerPokemon: getPlayerPokemonStyle(playerPokemonStyle),
    HPContainer: getHPContainerStyle(mewState),
    HPBar: getHPBarStyle(),
    HPFill: getHPFillStyle(mewState)
  };
  return (
    <Box sx={styles.battleContainer}>
      <Box component="img" src={professorOak} sx={styles.oak} />
      <Box component="img" src={data?.sprites.front_default} sx={styles.mew} />
      <Box component="img" src={starterPokemonState?.sprites.back_default} sx={styles.playerPokemon} />
      <Box sx={styles.HPContainer}>
        <Box sx={styles.HPBar}>
          <Typography sx={{ position: 'absolute', bottom: '50%' }}>Mew Lvl 99</Typography>
          <Box sx={styles.HPFill}></Box>
        </Box>
      </Box>
      <Dialog />
    </Box>
  );
}
