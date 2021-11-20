const randomPointBySize = (width, height, r) => () => ({
  cx: Math.random() * width >> 0,
  cy: Math.random() * height >> 0,
  r: Math.random() * r >> 0 || 1,
  direction: Math.random() * Math.PI*2,
  speed: 0.5,
});

const movePointBySize = (width, height) => ({ cx, cy, r, direction, speed }) => {
  const x = (cx + Math.cos(direction) * speed) % width;
  const y = (cy + Math.sin(direction) * speed) % height;

  return {
    cx: x > 0 ? x : x + width,
    cy: y > 0 ? y : y + height,
    r,
    direction,
    speed,
  }
};

const combine = ([ left, ...rest ]) => rest.length
 ? rest.map(right => ({ left, right })).concat(combine(rest))
 : [];

const getLines = (points, links, maxDistance) => {
  const { compose, map, filter, toArray } = transducers;
  const xf = compose(
    map(({ left, right }) => {
      const x1 = points[left].cx;
      const y1 = points[left].cy;
      const x2 = points[right].cx;
      const y2 = points[right].cy;
      const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

      return {
        x1,
        y1,
        x2,
        y2,
        distance,
      };
    }),
   filter(line => line.distance < maxDistance),
   map(line => ({ ...line, opacity: 1 - line.distance / maxDistance })),
  );
  const result = toArray(links, xf);
  return result;
}

const Particles = ({ points, lines, width, height })=> {
  return (
    <svg width={width} height={height}>
      {points.map((d, i) => <circle key={i} {...d} fill="#060d20"/>)}
      {lines.map(({ opacity, ...d }, i) => (
        <line
          key={i}
          {...d}
          stroke="#060d20"
          strokeWidth="1"
          style={{ opacity }}
         />
      ))}
    </svg>
   );
}


const root = document.getElementById('test');
const dpi = window.devicePixelRatio || 1;
const maxR = 2 * dpi;//86
const maxDistance = 100 * dpi;//108
let width = root.offsetWidth * dpi;//74
let height = root.offsetHeight * dpi;//74
root.setAttribute('width', width);//84
root.setAttribute('height', height);//69
const randomPoint = randomPointBySize(width, height, maxR);//81
const ctx = root.getContext('2d');//75
let points = new Array(250).fill(0).map(randomPoint);//amout of point
let links = combine(points.map((_, i) => i));

window.onresize = () => {
  width = root.offsetWidth * dpi;
  height = root.offsetHeight * dpi;
  root.setAttribute('width', width);
  root.setAttribute('height', height);
}

const draw = (points, lines) => {
  ctx.clearRect(0, 0, width, height);
  points.forEach(point => {
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(point.cx, point.cy, point.r, 0, Math.PI * 2);
    ctx.fill();
  });

  lines.forEach(line => {
    ctx.beginPath();
    //var gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
    var gradient = ctx.createLinearGradient(0, 0, width, height);
    //gradient.addColorStop(0.5, `rgba(0, 255, 255, ${line.opacity})`);
    gradient.addColorStop(0, `rgba(249, 249, 249, ${line.opacity})`);
    gradient.addColorStop(1, `rgba(85, 134, 193, ${line.opacity})`);
    ctx.strokeStyle = gradient;
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  });
}

const loop = t => {
  /*
  ReactDOM.render(
    <Particles
      points={points}
      lines={getLines(points, links, maxDistance)}
      width={width}
      height={height}
    />,
    root
  );
 */
  draw(points, getLines(points, links, maxDistance));

  const movePoint = movePointBySize(width, height);
  points = points.map(movePoint);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
