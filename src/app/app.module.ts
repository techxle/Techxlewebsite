import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FooterComponent } from './pages/footer/footer.component';
import { ServiceComponent } from './pages/services/services.component';
import { HeaderComponent } from './pages/header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MatCardModule } from "@angular/material/card";
import { PowerplatformComponent } from './pages/powerplatform/powerplatform.component';
import { CloudappComponent } from './pages/cloudapp/cloudapp.component';
import { StaffingComponent } from './pages/staffing/staffing.component';
import { UIComponent } from './pages/ui/ui.component';
import { FullstackComponent } from './pages/fullstack/fullstack.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MissionComponent } from './pages/mission/mission.component';
import { DesignComponent } from './pages/design/design.component';
import { SolutionsComponent } from './pages/solutions/solutions.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { AiComponent } from './pages/ai/ai.component';
import { DevopsComponent } from './pages/devops/devops.component';
import { HomeComponent } from './pages/home/home.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { AcquisComponent } from './pages/acquis/acquis.component';
import { SampleComponent } from './pages/sample/sample.component';
import { ProjectComponent } from './pages/project/project.component';
import { ReviewComponent } from './pages/review/review.component';
import { GrantComponent } from './pages/grant/grant.component';
import { HealthcareComponent } from './pages/healthcare/healthcare.component';
import { PsComponent } from './pages/ps/ps.component';
import { SaleComponent } from './pages/sale/sale.component';
import { NgbModule, NgbScrollSpyModule } from '@ng-bootstrap/ng-bootstrap';
import { HeroSectionComponent } from './pages/hero-section/hero-section.component';
import { FormComponent } from './pages/form/form.component';
import { NavbarDirective } from './pages/directives/navbar.directive';
import { LabaxLimsComponent } from './pages/labax-lims/labax-lims.component';
import { ErpSolutionsComponent } from './pages/erp-solutions/erp-solutions.component';
import { RagComponent } from './pages/rag/rag.component';
import { VideoPlayerComponent } from './pages/video-player/video-player.component';
import { HomeIndustriesComponent } from './pages/home-industries/home-industries.component';
import { CaseStudyComponent } from './pages/case-study/case-study.component';
import { CoreCapabilitiesComponent } from './pages/core-capabilities/core-capabilities.component';
import { HomeCarouselComponent } from './pages/home-carousel/home-carousel.component';
import { BelovedCustomerComponent } from './pages/beloved-customer/beloved-customer.component';
import { DrivingComponent } from './pages/driving/driving.component';
import { ServicesOfferComponent } from './pages/services-offer/services-offer.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    ServiceComponent,
    HeaderComponent,
    AboutusComponent,
    ContactComponent,
    PowerplatformComponent,
    CloudappComponent,
    StaffingComponent,
    UIComponent,
    FullstackComponent,
    MissionComponent,
    DesignComponent,
    SolutionsComponent,
    ContactComponent,
    AiComponent,
    DevopsComponent,
    HomeComponent,
    InventoryComponent,
    AcquisComponent,
    SampleComponent,
    ProjectComponent,
    ReviewComponent,
    GrantComponent,
    HealthcareComponent,
    PsComponent,
    SaleComponent,
    HeroSectionComponent,
    FormComponent,
    NavbarDirective,
    LabaxLimsComponent,
    ErpSolutionsComponent,
    RagComponent,
    VideoPlayerComponent,
    HomeIndustriesComponent,
    CaseStudyComponent,
    CoreCapabilitiesComponent,
    HomeCarouselComponent,
    BelovedCustomerComponent,
    DrivingComponent,
    ServicesOfferComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbScrollSpyModule,
    DragDropModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
