export function GrandChildHeaderLink({data}: any) {
  return (
    <ul className="mt-[10px]">
      {data.map((item: any) => {
        // console.log(item);
        return (
          <li key={item.title} className="font-normal text-[12px]">
            {item.title}
          </li>
        );
      })}
    </ul>
  );
}
