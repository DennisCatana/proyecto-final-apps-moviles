import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TerrenosPage } from './terrenos.page';

describe('TerrenosPage', () => {
  let component: TerrenosPage;
  let fixture: ComponentFixture<TerrenosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TerrenosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
