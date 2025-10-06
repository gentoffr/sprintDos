import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsJuegos } from './cards-juegos';

describe('CardsJuegos', () => {
  let component: CardsJuegos;
  let fixture: ComponentFixture<CardsJuegos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsJuegos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsJuegos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
