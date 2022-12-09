import Link from 'next/link';
import { useEffect } from 'react';
import { injectable, disposer, page, registerPageClass, useInject } from '@/lib/framework';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';

declare global {
  interface DIMapper {
    'DI.Test': Foo;
  }
}

@injectable()
@page()
class Foo {
  @observable
  count: number = 0;

  constructor() {
    console.log('create foo');

    makeObservable(this);
  }

  increment = () => {
    this.count++;
  };

  @disposer()
  release() {
    console.log('release');
  }
}

registerPageClass('DI.Test', Foo);

const About = observer(() => {
  const foo = useInject('DI.Test');

  useEffect(() => {
    console.log('render about');
  }, []);

  return (
    <div onClick={foo.increment}>
      about: {foo.count}, <Link href="/123">goto 123</Link>
    </div>
  );
});

export default About;
