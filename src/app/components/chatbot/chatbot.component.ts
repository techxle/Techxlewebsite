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

  readonly SUPPORT_EMAIL = 'sampletesting.567123@gmail.com';
  readonly FORMSUBMIT_TOKEN = '28f46c18e1313472aea9438abd17fb2c';

  isOpen = false;
  isMinimized = false;
  userInput = '';
  isTyping = false;
  hasUnread = true;
  showTeaser = true;
  messages: ChatMessage[] = [];
  quickSuggestions: string[] = [];

  // State for asking user's from email for unanswered major questions
  pendingQueryForEmail: string | null = null;
  pendingMsgForEmail: ChatMessage | null = null;
  userEnteredEmail = '';
  emailInputError = '';

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

    // Check if the user is replying with their "from email" for a pending major question
    if (this.pendingQueryForEmail) {
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
      const match = query.match(emailRegex);
      if (match) {
        const fromEmail = match[1];
        const userMsg: ChatMessage = {
          id: 'usr-' + Date.now(),
          sender: 'user',
          text: query,
          timestamp: new Date()
        };
        this.messages.push(userMsg);
        this.userInput = '';
        this.needsScroll = true;
        this.saveHistory();

        const pendingQuery = this.pendingQueryForEmail;
        const targetMsg = this.pendingMsgForEmail;
        this.sendQueryEmailWithFromAddress(fromEmail, pendingQuery, targetMsg);
        return;
      }
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
        botMsg.userQuery = query;
        if (botMsg.needsUserEmail) {
          this.pendingQueryForEmail = query;
          this.pendingMsgForEmail = botMsg;
          botMsg.emailStatus = 'pending';
        }
        this.messages.push(botMsg);
        this.needsScroll = true;
        this.saveHistory();
      },
      error: () => {
        this.isTyping = false;
        const errMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: `I apologize, but I encountered an issue processing your request: **"${query}"**.\n\nPlease share your email address so our team can follow up with you directly:`,
          timestamp: new Date(),
          userQuery: query,
          isUnknown: true,
          needsUserEmail: true,
          emailStatus: 'pending',
          actions: [
            { label: 'Go to Contact Page', route: '/contact-us', type: 'route' }
          ]
        };
        this.pendingQueryForEmail = query;
        this.pendingMsgForEmail = errMsg;
        this.messages.push(errMsg);
        this.needsScroll = true;
        this.saveHistory();
      }
    });
  }

  handleAction(action: ChatAction): void {
    if (action.type === 'route' && action.route) {
      this.router.navigateByUrl(action.route);
    } else if (action.type === 'link' && action.url) {
      window.open(action.url, '_blank');
    } else if (action.type === 'query' && action.query) {
      this.sendMessage(action.query);
    }
  }

  /**
   * User clicks "Send to Support" on the inline email prompt.
   */
  submitUserEmail(msg: ChatMessage): void {
    const email = this.userEnteredEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailInputError = 'Please enter a valid email address (e.g. name@company.com)';
      return;
    }
    this.emailInputError = '';
    const q = msg.userQuery || this.pendingQueryForEmail || 'Inquiry regarding Techxle';
    this.sendQueryEmailWithFromAddress(email, q, msg);
  }

  /**
   * Directly sends the unanswered query to sampletesting.567123@gmail.com
   * with the user's provided "from" email as reply-to.
   */
  sendQueryEmailWithFromAddress(fromEmail: string, query: string, msg: ChatMessage | null): void {
    if (typeof window === 'undefined' || !fromEmail || !query) {
      return;
    }

    if (msg) {
      msg.emailStatus = 'sending';
      msg.fromEmail = fromEmail;
    }

    fetch(`https://formsubmit.co/ajax/${this.FORMSUBMIT_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: fromEmail,
        _replyto: fromEmail,
        _subject: query,
        message: query,
        _captcha: 'false'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (msg) {
          msg.emailStatus = 'sent';
          msg.emailSent = true;
        }
        this.pendingQueryForEmail = null;
        this.pendingMsgForEmail = null;
        this.userEnteredEmail = '';

        // Add friendly confirmation bot message to the conversation
        const confirmMsg: ChatMessage = {
          id: 'confirm-' + Date.now(),
          sender: 'bot',
          text: `✅ **Query Sent Successfully!**

I have forwarded your question to **${this.SUPPORT_EMAIL}** with your email **${fromEmail}** as the reply address:
> *"${query}"*

Our specialized team will review your question and respond directly to **${fromEmail}** shortly!`,
          timestamp: new Date(),
          isUnknown: false,
          actions: [
            { label: 'Explore Services', route: '/services', type: 'route' },
            { label: 'Explore Solutions', route: '/solutions', type: 'route' },
            { label: 'Contact Us', route: '/contact-us', type: 'route' }
          ]
        };

        this.messages.push(confirmMsg);
        this.saveHistory();
        this.needsScroll = true;
      })
      .catch(err => {
        console.warn('Direct email sending issue:', err);
        if (msg) {
          msg.emailStatus = 'error';
        }
        this.saveHistory();
      });
  }

  openGmailWeb(msg: ChatMessage): void {
    const q = msg.userQuery || msg.text || '';
    const subject = encodeURIComponent(q);
    const body = encodeURIComponent(q);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(this.SUPPORT_EMAIL)}&su=${subject}&body=${body}`;
    if (typeof window !== 'undefined') {
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    }
  }

  openMailto(msg: ChatMessage): void {
    const q = msg.userQuery || msg.text || '';
    const subject = encodeURIComponent(q);
    const body = encodeURIComponent(q);
    const mailtoUrl = `mailto:${this.SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
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
