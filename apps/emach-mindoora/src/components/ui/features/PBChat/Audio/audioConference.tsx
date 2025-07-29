"use client";

import {
  LayoutContextProvider,
  ParticipantLoop,
  ParticipantAudioTile,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { setupDisconnectButton } from "@livekit/components-core";
import { useRoomContext } from "@livekit/components-react";
import { ControlBar } from "./controlBar";
import { Styled } from "./Audio.styled";

export function AudioConference({ ...props }: any) {
    const room = useRoomContext();
    const participants = useParticipants();
    const { disconnect } = setupDisconnectButton(room);

    return (
      <>
        <ParticipantLoop participants={participants}>
          <LayoutContextProvider>
            <Styled.AudioBackground className="lk-audio-conference" {...props}>
              <div className="lk-audio-conference-stage">
                  <ParticipantAudioTile />
                  <ControlBar />
              </div>
            </Styled.AudioBackground>
          </LayoutContextProvider>
        </ParticipantLoop>
      </>
    );
  }
