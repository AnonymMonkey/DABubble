import { DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { UserService } from '../../../../../shared/services/user-service/user.service';

@Component({
  selector: 'app-own-private-message-show',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './own-private-message-show.component.html',
  styleUrl: './own-private-message-show.component.scss'
})
export class OwnPrivateMessageShowComponent {
  @Input() message: any
  @Input() displayName: string = ''
  public userService = inject(UserService)

}
