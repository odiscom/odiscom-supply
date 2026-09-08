import assert from 'node:assert/strict'
import {test} from 'node:test'
import {amount,money,totalFor,margins,supplierMetrics,canIssueQuote,recordTotal,hardwareLineProfit} from '../lib/pricing.js'
test('unknown prices and costs never become zero',()=>{for(const value of [null,undefined,'',NaN,'invalid',false]) assert.equal(amount(value),null);assert.equal(amount(0),0);assert.equal(money(-10),'$-10.00');assert.equal(totalFor([]),null);assert.equal(totalFor([{quantity:1,unit_price:null}]),null)})
test('complete explicit zero cost is valid, unconfirmed default zero is unknown',()=>{assert.equal(totalFor([{quantity:2,unit_cost:0}],'unit_cost'),null);assert.equal(totalFor([{quantity:2,unit_cost:0,cost_confirmed:true}],'unit_cost'),0);assert.deepEqual(margins(100,null),{grossProfit:null,margin:null})})
test('partial supplier quotes cannot manufacture a 100 percent profit',()=>{for(const patch of [{material_cost:null},{freight_cost:null},{costs_confirmed:false}]) assert.equal(supplierMetrics({material_cost:10,freight_cost:0,other_cost:0,sell_price:20,costs_confirmed:true,...patch}).margin,null);assert.equal(supplierMetrics({material_cost:10,freight_cost:0,other_cost:0,sell_price:20,costs_confirmed:true}).margin,50)})
test('issued quotes require a priced positive quantity on every line',()=>{assert.equal(canIssueQuote([]),false);assert.equal(canIssueQuote([{quantity:1,unit_price:null}]),false);assert.equal(canIssueQuote([{quantity:0,unit_price:10}]),false);assert.equal(canIssueQuote([{quantity:2,unit_price:10}]),true);assert.equal(totalFor([{quantity:3,unit_price:0.335}]),1.01)})
test('pipeline and account totals reject incomplete records and preserve explicit zero',()=>{
  assert.equal(recordTotal([{total:120},{total:null}],'total'),null)
  assert.equal(recordTotal([{total:120},{total:0}],'total'),120)
  assert.equal(margins(recordTotal([{target:100}],'target'),recordTotal([{cost:null}],'cost')).grossProfit,null)
  for(const invalid of ['   ',[],{},false]) assert.equal(amount(invalid),null)
})
test('hardware BOM profit needs verified quantity and both prices',()=>{
  const line={quantity:2,quantity_status:'verified',unit_cost:5,sell_unit_price:9}
  assert.equal(hardwareLineProfit(line),8)
  for(const patch of [{quantity_status:'unknown'},{unit_cost:null},{sell_unit_price:null},{quantity:null}]) assert.equal(hardwareLineProfit({...line,...patch}),null)
  assert.equal(hardwareLineProfit({...line,unit_cost:0}),18)
  assert.equal(hardwareLineProfit({...line,sell_unit_price:0}),-10)
})
