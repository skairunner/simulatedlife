declare module 'rc-checkbox' {
  import * as React from 'react';

  interface CheckboxProps {
    prefixCIs?: string;
    className?: string;
    name?: string;
    checked?: 0|1|2;
    defaultChecked?: 0|1|2;
    onChange?(e: Event, checked: number): void;
  }
  
  class Checkbox extends React.Component<CheckboxProps, Object> {
  }
  
  export default Checkbox;
}