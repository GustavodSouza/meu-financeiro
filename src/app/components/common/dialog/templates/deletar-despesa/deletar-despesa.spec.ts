import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletarDespesa } from './deletar-despesa';

describe('DeletarDespesa', () => {
  let component: DeletarDespesa;
  let fixture: ComponentFixture<DeletarDespesa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletarDespesa],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletarDespesa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
