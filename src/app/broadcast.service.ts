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

/**
 * The service above doesn’t run Angular’s zone, since it uses an API that does not hook into Angular.
 * This custom OperatorFunction makes sure the observable runs in the zone.
 */
function runInsideZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) => {
    return new Observable(obs => {
      // makes sure that lifecycle hooks of an Observable are run in the NgZone.
      const next = (value: T) => zone.run(() => obs.next(value));
      const error = (e: any) => zone.run(() => obs.error(e));
      const complete = () => zone.run(() => obs.complete());
      return source.subscribe({ next, error, complete });
    });
  };
}

export class BroadcastService {
  private broadcastChannel: BroadcastChannel;
  private onMessage = new Subject<any>();

  constructor(name: string, private ngZone: NgZone) {
    this.broadcastChannel = new BroadcastChannel(name);
    this.broadcastChannel.onmessage = (message) => this.onMessage.next(message.data);
  }

  // sends message to all channel subscribers
  publish(message: BroadcastMsg): void {
    this.broadcastChannel.postMessage(message);
  }

  // return a observable of BroadcastMsg
  onMessageOfType(type: MsgType): Observable<BroadcastMsg> {
    return this.onMessage.pipe(
      runInsideZone(this.ngZone), // custom OperatorFunction makes sure the observable runs in the NgZone.
      filter(message => message.type === type)
    );
  }
}
