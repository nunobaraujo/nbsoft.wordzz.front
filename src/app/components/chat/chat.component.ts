import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GameService } from 'src/app/Services/game.service';
import { ChatMessage } from 'src/app/Models/chatMessage';
import { faShare } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit,AfterViewChecked  {  
  @ViewChild('chatLog') private myScrollContainer: ElementRef;
  
  faShare = faShare;

  chatForm: FormGroup;  
  message = '';
  messages$:Observable<ChatMessage[]>;
    
  constructor(private formBuilder: FormBuilder,    
    private gameService: GameService) 
  {
    this.messages$  = gameService.messages$;
  }
  
  ngOnInit(): void {    
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
    this.scrollToBottom();    
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
 

  get f() { return this.chatForm.controls; }

  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  public sendMessage(): void {
    this.gameService.sendMessage(this.f.message.value);
    this.f.message.setValue("");
  }

}
