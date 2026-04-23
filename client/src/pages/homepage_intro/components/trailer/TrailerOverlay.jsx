import { useEffect, useRef, useState } from "react";

export default function TrailerOverlay() {
    const [showSkip, setShowSkip] = useState(false);
    const hasStartedScrollingRef = useRef(false);

    useEffect(() => {
        let timerId;

        const onFirstScrollIntent = () => {
            if (hasStartedScrollingRef.current) return;
            hasStartedScrollingRef.current = true;
            timerId = window.setTimeout(() => {
                setShowSkip(true);
            }, 1500);
        };

        const onKeyScrollIntent = (event) => {
            const scrollKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space"];
            if (scrollKeys.includes(event.code)) {
                onFirstScrollIntent();
            }
        };

        window.addEventListener("wheel", onFirstScrollIntent, { passive: true });
        window.addEventListener("touchmove", onFirstScrollIntent, { passive: true });
        window.addEventListener("keydown", onKeyScrollIntent);

        return () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
            window.removeEventListener("wheel", onFirstScrollIntent);
            window.removeEventListener("touchmove", onFirstScrollIntent);
            window.removeEventListener("keydown", onKeyScrollIntent);
        };
    }, []);

    return (
        <>
            <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 pointer-events-none">
                <a
                    href="/homepage"
                    className={`pointer-events-auto inline-flex items-center rounded-full border border-emerald-500/40 bg-slate-950/70 px-4 py-2 text-xs sm:px-5 sm:text-sm font-semibold tracking-wide text-emerald-300 backdrop-blur-md transition-all duration-300 hover:bg-emerald-500 hover:text-slate-950 ${showSkip ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                    aria-hidden={!showSkip}
                    tabIndex={showSkip ? 0 : -1}
                >
                    Skip
                </a>
            </div>

            <section className="h-screen flex flex-col items-center justify-end pb-20 sm:pb-24 px-5 sm:px-6 text-center">
                <p className="text-emerald-400 font-semibold tracking-widest uppercase text-xs sm:text-sm mb-4">
                    Scroll to experience
                </p>
                <div className="w-0.5 h-16 bg-emerald-500/50 animate-pulse rounded-full" />
            </section>

            <section className="h-screen flex items-center justify-start px-4 sm:px-[10%] pointer-events-none">
                <div className="max-w-md bg-slate-900/40 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-slate-800">
                    <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Carve out the space.</h2>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                        Upload your branded event template. We&apos;ll automatically map the photo area and make room for your community.
                    </p>
                </div>
            </section>

            <section className="h-screen flex items-center justify-end px-4 sm:px-[10%] pointer-events-none">
                <div className="max-w-md bg-slate-900/40 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-slate-800 text-right">
                    <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Share the Magic.</h2>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                        Generate a single, powerful link. Send it to your attendees and watch the engagement skyrocket.
                    </p>
                </div>
            </section>

            <section className="h-screen flex items-end justify-center pb-24 sm:pb-32 px-4 pointer-events-none">
                <div className="max-w-lg text-center bg-slate-900/40 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-slate-800">
                    <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-emerald-400">The Perfect Fit.</h2>
                    <p className="text-slate-300 text-base sm:text-lg">
                        Guests upload their photo. It snaps perfectly into your brand. No editing required.
                    </p>
                </div>
            </section>

            <section className="h-screen flex items-center justify-center px-4">
                <div className="text-center bg-slate-950/80 backdrop-blur-xl p-6 sm:p-12 rounded-3xl border border-emerald-500/30 max-w-2xl shadow-2xl shadow-emerald-900/20">
                    <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6">Go Viral.</h2>
                    <p className="text-base sm:text-xl text-slate-400 mb-8 sm:mb-10">
                        Turn your attendees into your biggest promoters. One customized frame at a time.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                        <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-full transition-transform hover:scale-105 duration-200 cursor-pointer pointer-events-auto">
                            Start Your Event Free
                        </button>
                        <a
                            href="/homepage"
                            className="w-full sm:w-auto bg-transparent hover:bg-emerald-500 text-slate-300 font-bold text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-full transition-transform hover:scale-105 duration-200 cursor-pointer pointer-events-auto"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
