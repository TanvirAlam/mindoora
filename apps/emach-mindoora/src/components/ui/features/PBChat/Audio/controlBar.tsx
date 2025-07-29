"use client";

import {
  useLocalParticipantPermissions,
  TrackToggle,
  MediaDeviceMenu,
  StartAudio,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

export function ControlBar() {
    const visibleControls = { leave: true };
    const localPermissions = useLocalParticipantPermissions();

    if (!localPermissions) {
      visibleControls.microphone = false;
    } else {
      visibleControls.microphone ??= localPermissions.canPublish;
    }

    return (
      <div>
        {visibleControls.microphone && (
          <div className="lk-button-group">
            <TrackToggle source={Track.Source.Microphone} showIcon={true}>
              {true && "Microphone"}
            </TrackToggle>
            <div className="lk-button-group-menu">
              <MediaDeviceMenu kind="audioinput" />
            </div>
          </div>
        )}
        <StartAudio label="Start Audio" />
      </div>
    );
  }
