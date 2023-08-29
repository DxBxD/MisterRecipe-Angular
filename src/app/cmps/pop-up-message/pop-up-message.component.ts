import { Component, Input, OnInit } from '@angular/core'
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations'

@Component({
  selector: 'app-pop-up-message',
  templateUrl: './pop-up-message.component.html',
  styleUrls: ['./pop-up-message.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateX(100%)' }),
        animate(300)
      ]),
      transition('* => void', [
        animate(200, style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class PopUpMessageComponent implements OnInit {
  @Input() message: string = ''
  @Input() showMessage: boolean = false

  constructor() { }

  ngOnInit(): void {
  }
}
