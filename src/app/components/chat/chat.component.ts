import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GameService } from 'src/app/Services/game.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {  
  chatForm: FormGroup;
  
  message = '';
  messages: string[];
  
  constructor(private formBuilder: FormBuilder,    
    private gameService: GameService) 
  {
    this.messages  = gameService.Messages;
  }
  ngOnInit(): void {    
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });    
  }
 

  get f() { return this.chatForm.controls; }

  public sendMessage(): void {
    this.gameService.sendMessage(this.f.message.value);
  }

}
