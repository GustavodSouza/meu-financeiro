import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPorCategoria } from './card-por-categoria';

describe('CardPorCategoria', () => {
  let component: CardPorCategoria;
  let fixture: ComponentFixture<CardPorCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPorCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPorCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
