import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUltimasDespesas } from './card-ultimas-despesas';

describe('CardUltimasDespesas', () => {
  let component: CardUltimasDespesas;
  let fixture: ComponentFixture<CardUltimasDespesas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUltimasDespesas],
    }).compileComponents();

    fixture = TestBed.createComponent(CardUltimasDespesas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
