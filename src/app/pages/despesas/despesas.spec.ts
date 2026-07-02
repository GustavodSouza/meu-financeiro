import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Despesas } from './despesas';

describe('Despesas', () => {
  let component: Despesas;
  let fixture: ComponentFixture<Despesas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Despesas],
    }).compileComponents();

    fixture = TestBed.createComponent(Despesas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
