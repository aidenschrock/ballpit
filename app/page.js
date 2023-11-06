"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, usePlane, useSphere, Debug } from "@react-three/cannon";
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { OrderedDither } from "./ordered dither/OrderedDither";
import * as THREE from "three";
import { useMemo } from "react";

const colors = [
  "#0a3be7",
  "#7694ff",
  "#ffffff",
  "#0a3be7",
  "#7694ff",
  "#ffffff",
  "#0a3be7",
  "#7694ff",
  "#ffffff",
  "#0a3be7",
  "#7694ff",
  "#ffffff",
  "#0a3be7",
  "#7694ff",
  "#ffffff",
  "#0a3be7",
  "#7694ff",
  "#ffffff",
];
const tempColor = new THREE.Color();

export default function Home() {
  function InstancedSpheres({ count = 18 }) {
    const colorArray = useMemo(
      () =>
        Float32Array.from(
          new Array(count * 3)
            .fill()
            .flatMap((_, i) => tempColor.set(colors[i]).toArray())
        ),
      []
    );

    const { viewport } = useThree();

    const [ref] = useSphere((index) => ({
      mass: 100,
      position: [5 - Math.random() * 10, viewport.height + index * 0.1, 0, 0],
      args: [2],
    }));
    return (
      <instancedMesh ref={ref} args={[null, null, count]}>
        <sphereGeometry args={[2, 32, 32]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colorArray, 3]}
          />
        </sphereGeometry>
        <meshLambertMaterial vertexColors />
      </instancedMesh>
    );
  }

  function Borders() {
    const { viewport } = useThree();
    return (
      <>
        <Plane
          position={[0, -viewport.height / 1.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Plane position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Plane position={[10, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Plane position={[0, 0, -2]} rotation={[0, 0, 0]} />
        <Plane position={[0, 0, 2]} rotation={[0, -Math.PI, 0]} />
      </>
    );
  }

  function Plane({ color, ...props }) {
    usePlane(() => ({ ...props }));
    return null;
  }

  function Mouse() {
    const { viewport } = useThree();
    const [, api] = useSphere(() => ({ type: "Kinematic", args: [7] }));
    return useFrame((state) =>
      api.position.set(
        (state.mouse.x * viewport.width) / 2,
        (state.mouse.y * viewport.height) / 2,
        7
      )
    );
  }

  return (
    <main className="main">
      <Canvas
        gl={{ stencil: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 50, near: 17, far: 40 }}
      >
        <color attach="background" args={["#FFFFFF"]} />
        <ambientLight color={"#0a3be7"} intensity={4} />

        <directionalLight intensity={4} position={[10, 20, 20]} />
        <Physics
          gravity={[0, -25, 0]}
          defaultContactMaterial={{ restitution: 0.1, friction: 0 }}
        >
          <group position={[0, 0, -10]}>
            <Mouse />
            {/* <Debug> */}
            <Borders />
            {/* </Debug> */}

            <InstancedSpheres />
          </group>
        </Physics>
        <EffectComposer>
          <OrderedDither invertDither={false} darkThreshold={10} />
          <SSAO
            radius={0.4}
            intensity={50}
            luminanceInfluence={0.4}
            color="#0a3be7"
          />
        </EffectComposer>
      </Canvas>
    </main>
  );
}
