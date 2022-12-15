import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BROADCAST_SERVICE_TOKEN, BroadcastService } from './broadcast.service';

type Action = 'add' | 'subtract'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'BroadcastChannel Api Example';
  counter = 0;
  subs = new Subscription();

  constructor(
    @Inject(BROADCAST_SERVICE_TOKEN)
    private broadcastService: BroadcastService) { }

  ngOnInit(): void {
    this.subs.add(
      this.broadcastService.onMessageOfType('counter')
        .subscribe(message => this.counter = message.count));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  publishMessage(action: Action) {
    if (action === 'add') {
      this.counter++;
    } else if (action === 'subtract') {
      this.counter--;
    } else {
      console.warn('Invalid action');
      return;
    }

    this.broadcastService.publish({
      type: 'counter',
      count: this.counter
    })
  }
}


