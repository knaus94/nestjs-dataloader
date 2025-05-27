import { Injectable, SetMetadata } from '@nestjs/common';
import { METADATA_KEY } from '../constants';

export function DataloaderProvider(): ClassDecorator {
  return (target) => {
    Injectable({ scope: undefined })(target);
    SetMetadata(METADATA_KEY, true)(target);
  };
}
