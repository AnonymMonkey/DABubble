import { DatePipe, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { UserService } from '../../../../../shared/services/user-service/user.service';
import { MessageReactionsComponent } from '../../../../../shared/components/message-reactions/message-reactions.component';

@Component({
  selector: 'app-own-private-message-show',
  standalone: true,
  imports: [DatePipe, MessageReactionsComponent, NgIf],
  templateUrl: './own-private-message-show.component.html',
  styleUrl: './own-private-message-show.component.scss'
})
export class OwnPrivateMessageShowComponent {
  @Input() message: any
  @Input() displayName: string = ''
  public userService = inject(UserService)

}
