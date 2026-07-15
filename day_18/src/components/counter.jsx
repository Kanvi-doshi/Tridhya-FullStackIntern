function Display({ count }) {
  return <h1>{count}</h1>
    }

function Buttons({ count, setCount }) {
  return (
    <>
      <div className="buttons">
        <button className="increment" onClick={() => setCount(count + 1)}>
          +
        </button>
        <button className="decrement" onClick={() => setCount(count - 1)}>
          -
        </button>
        <button className="reset" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </>
  );
}

function Counter({ count, setCount }) {
  return (
    <div className="counter">
      <Display count={count} />
      <Buttons count={count} setCount={setCount} />
    </div>
  );
}
export default Counter;

// function Counter({ count, setCount }) {
//   return (
//     <div>
//       <h1>{count}</h1>

//       <button onClick={() => setCount(count + 1)}>
//         Increment
//       </button>

//       <button onClick={() => setCount(count - 1)}>
//         Decrement
//       </button>

//       <button onClick={() => setCount(0)}>
//         Reset
//       </button>
//     </div>
//   );
// }

// export default Counter;
