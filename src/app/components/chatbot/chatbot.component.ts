import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ChatbotService, ChatMessage, ChatAction } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('queryInput') private queryInput?: ElementRef<HTMLInputElement>;
  @ViewChild('chatWindow') private chatWindowRef?: ElementRef<HTMLDivElement>;

  isOpen = false;
  isMinimized = false;
  userInput = '';
  isTyping = false;
  hasUnread = true;
  showTeaser = true;
  messages: ChatMessage[] = [];
  quickSuggestions: string[] = [];

  // Drag and drop position tracking
  dragPosition = { x: 0, y: 0 };
  isMobile = false;

  get isMoved(): boolean {
    return Math.abs(this.dragPosition.x) > 10 || Math.abs(this.dragPosition.y) > 10;
  }

  private needsScroll = false;
  private readonly STORAGE_KEY = 'techxle_chatbot_conversation_v1';

  constructor(
    private chatbotService: ChatbotService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.quickSuggestions = this.chatbotService.getQuickSuggestions();
    this.loadHistory();
    this.checkMobile();

    // Auto-hide the teaser after 10 seconds if not interacted
    setTimeout(() => {
      this.showTeaser = false;
    }, 10000);
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll) {
      this.scrollToBottom();
      this.needsScroll = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    if (this.isOpen && !this.isMinimized && this.isMoved) {
      this.clampPositionToViewport();
    }
  }

  checkMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 576;
    }
  }

  onDragEnded(event: CdkDragEnd): void {
    const pos = event.source.getFreeDragPosition();
    this.dragPosition = { x: pos.x, y: pos.y };
  }

  resetPosition(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.dragPosition = { x: 0, y: 0 };
  }

  clampPositionToViewport(): void {
    if (typeof window === 'undefined' || !this.chatWindowRef?.nativeElement) {
      return;
    }
    setTimeout(() => {
      if (!this.chatWindowRef?.nativeElement) return;
      const rect = this.chatWindowRef.nativeElement.getBoundingClientRect();
      let newX = this.dragPosition.x;
      let newY = this.dragPosition.y;

      if (rect.bottom > window.innerHeight - 10) {
        newY -= (rect.bottom - (window.innerHeight - 10));
      }
      if (rect.top < 10) {
        newY += (10 - rect.top);
      }
      if (rect.right > window.innerWidth - 10) {
        newX -= (rect.right - (window.innerWidth - 10));
      }
      if (rect.left < 10) {
        newX += (10 - rect.left);
      }

      if (newX !== this.dragPosition.x || newY !== this.dragPosition.y) {
        this.dragPosition = { x: newX, y: newY };
      }
    }, 60);
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.showTeaser = false;
    if (this.isOpen) {
      this.hasUnread = false;
      this.isMinimized = false;
      this.needsScroll = true;
      setTimeout(() => {
        this.queryInput?.nativeElement?.focus();
      }, 200);
    }
  }

  minimizeChat(event: MouseEvent): void {
    event.stopPropagation();
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      this.clampPositionToViewport();
    }
  }

  closeChat(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = false;
    this.isMinimized = false;
  }

  dismissTeaser(event: MouseEvent): void {
    event.stopPropagation();
    this.showTeaser = false;
  }

  sendMessage(textToSend?: string): void {
    const query = (textToSend !== undefined ? textToSend : this.userInput).trim();
    if (!query || this.isTyping) {
      return;
    }

    // User message
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.isTyping = true;
    this.needsScroll = true;
    this.saveHistory();

    // Bot response
    this.chatbotService.askQuestion(query).subscribe({
      next: (botMsg) => {
        this.isTyping = false;
        this.messages.push(botMsg);
        this.needsScroll = true;
        this.saveHistory();
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: 'I apologize, but I encountered an issue processing your request. Please try again or visit our [Contact Page](/contact-us).',
          timestamp: new Date(),
          actions: [{ label: 'Go to Contact Page', route: '/contact-us', type: 'route' }]
        });
        this.needsScroll = true;
        this.saveHistory();
      }
    });
  }

  handleAction(action: ChatAction): void {
    if (action.type === 'route' && action.route) {
      this.router.navigateByUrl(action.route);
      // On mobile we can optionally close, or leave open
    } else if (action.type === 'link' && action.url) {
      window.open(action.url, '_blank');
    } else if (action.type === 'query' && action.query) {
      this.sendMessage(action.query);
    }
  }

  selectSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  clearChat(): void {
    this.messages = [this.chatbotService.getGreetingMessage()];
    this.saveHistory();
    this.needsScroll = true;
  }

  formatMessageText(text: string): SafeHtml {
    if (!text) return '';

    // Convert markdown to HTML safely
    let formatted = text
      // Escape HTML entities first
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Markdown links [text](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-inline-link">$1</a>')
      // Bullet lists
      .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
      // Numbered lists
      .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li><strong>$1.</strong> $2</li>');

    // Wrap list items
    formatted = formatted.replace(/(<li>.*<\/li>)/gms, '<ul class="chat-bubble-list">$1</ul>');

    // Convert newlines to breaks (avoid double br inside ul)
    formatted = formatted.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (e) {
      // safe fallback
    }
  }

  private saveHistory(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Save last 25 messages
        const trimmed = this.messages.slice(-25);
        window.sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
      }
    } catch (e) {
      // sessionStorage might be restricted
    }
  }

  private loadHistory(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = window.sessionStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.messages = parsed.map(m => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }));
            this.hasUnread = false;
            return;
          }
        }
      }
    } catch (e) {
      // fallback
    }

    // Default welcome
    this.messages = [this.chatbotService.getGreetingMessage()];
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed(): void {
    if (this.isOpen) {
      this.closeChat();
    }
  }
}
