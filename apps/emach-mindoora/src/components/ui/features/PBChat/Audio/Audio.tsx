import { useState } from "react";
import { Styled } from "./Audio.styled";
import { AudioCall } from "./audioCall";

const Audio = () => {
    const [toggleAudio, setToggleAudio] = useState(false);

    return (
    <Styled.AudioWrapper 
        onClick={() => (!toggleAudio ? setToggleAudio(true) : null)}
        audioToggle={toggleAudio}
    >  
        <Styled.AudioIcon size={35} audioToggle={toggleAudio} />
        <Styled.Audio audioToggle={toggleAudio}>
            <Styled.AudioHeader>
                <Styled.Title>
                    <Styled.AudioIconOpen size={35} />
                </Styled.Title>
                <Styled.CrossButton
                    type="button"
                    onClick={() => setToggleAudio(false)}
                >
                    <Styled.CloseAudio size={25} />
                </Styled.CrossButton>
            </Styled.AudioHeader>
            <AudioCall />
        </Styled.Audio>
    </Styled.AudioWrapper>
    );
};

export default Audio;
