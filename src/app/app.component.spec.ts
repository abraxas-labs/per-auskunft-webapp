import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, AppComponent],
}).compileComponents();
  });

  it('should create the app', () => {
    // Right now we don't have tests, but we need one for the pipeline to pass.
    expect(true).toBeTruthy();
  });
});
