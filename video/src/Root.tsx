import React from 'react';
import {Composition} from 'remotion';
import {Tirai, DURATION} from './Tirai';

export const Root: React.FC = () => (
  <Composition
    id="Tirai"
    component={Tirai}
    durationInFrames={DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
