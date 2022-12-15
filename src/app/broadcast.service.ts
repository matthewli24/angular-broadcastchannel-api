import { inject, InjectionToken, NgZone } from '@angular/core';
import { filter, Observable, OperatorFunction, Subject } from 'rxjs';

type MsgType = 'counter';

export interface BroadcastMsg {
  type: MsgType;
  count: number;
}

/**
 * Use Angular’s InjectionToken to create a singleton instance of the service.
 */
export const BROADCAST_SERVICE_TOKEN = new InjectionToken<BroadcastService>(
  'broadcastService',
  {
    factory: () => new BroadcastService('counterBroadcastService', inject(NgZone))
  }
);


export class BroadcastService {
  private broadcastChannel: BroadcastChannel;
  private onMessage = new Subject<any>();

  constructor(name: string, private zone: NgZone) {
    this.broadcastChannel = new BroadcastChannel(name);
    this.broadcastChannel.onmessage = (message) =>
    // The service above doesn’t run Angular’s zone, since it uses an API that does not hook into Angular.
    // This makes sure the subject runs in the ngZone.
      this.zone.run(() => this.onMessage.next(message.data));
  }

  // sends message to all channel subscribers
  publish(message: BroadcastMsg): void {
    this.broadcastChannel.postMessage(message);
  }

  // return a observable of BroadcastMsg
  onMessageOfType(type: MsgType): Observable<BroadcastMsg> {
    return this.onMessage.pipe(filter(message => message.type === type));
  }
}
